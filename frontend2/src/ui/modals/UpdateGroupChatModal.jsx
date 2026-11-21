import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatState } from '../../context/ChatProvider';
import { Search, X, UserPlus, LogOut, Terminal } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../config/constants';

const UpdateGroupChatModal = ({ isOpen, onClose, fetchMessages }) => {
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);

    const { currentChat, setCurrentChat, user } = useChatState();

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen || !currentChat) return null;

    // --- SEARCH FOR NEW USERS ---
    const handleSearch = async (query) => {
        setSearch(query);
        const trimmed = query.trim();
        if (!trimmed) return setSearchResult([]);
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/users?search=${encodeURIComponent(trimmed)}`, config);
            setSearchResult(Array.isArray(data) ? data : []);
        } catch {
            toast.error("SEARCH_PROTOCOL_FAILED");
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATE GROUP NAME ---
    const handleRename = async () => {
        const trimmed = groupChatName.trim();
        if (!trimmed) return;
        try {
            setRenameLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API_BASE_URL}/api/chats/group`, {
                chatId: currentChat._id,
                chatName: trimmed,
            }, config);

            setCurrentChat(data);
            setGroupChatName("");
            setRenameLoading(false);
            toast.success("CHANNEL_ALIAS_UPDATED");
        } catch {
            toast.error("RENAME_REJECTED");
            setRenameLoading(false);
        }
    };

    // --- ADD USER TO GROUP ---
    const handleAddUser = async (userToAdd) => {
        if (currentChat.users.some((u) => u._id === userToAdd._id)) {
            return toast.error("NODE_ALREADY_CONNECTED");
        }
        if (currentChat.groupAdmin?._id !== user._id) {
            return toast.error("ADMIN_PRIVILEGES_REQUIRED");
        }

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API_BASE_URL}/api/chats/group/add`, {
                chatId: currentChat._id,
                userId: userToAdd._id,
            }, config);

            setCurrentChat(data);
            setLoading(false);
            toast.success("NODE_LINKED");
        } catch {
            toast.error("UPLINK_DENIED");
            setLoading(false);
        }
    };

    // --- REMOVE USER OR LEAVE GROUP ---
    const handleRemove = async (userToRemove) => {
        const isAdmin = currentChat.groupAdmin?._id === user._id;
        const isSelf = userToRemove._id === user._id;

        if (!isAdmin && !isSelf) {
            return toast.error("ADMIN_PRIVILEGES_REQUIRED");
        }

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API_BASE_URL}/api/chats/group/remove`, {
                chatId: currentChat._id,
                userId: userToRemove._id,
            }, config);

            // If user removed themselves, clear active chat safely
            if (isSelf) {
                setCurrentChat(null);
                onClose();
            } else {
                setCurrentChat(data);
            }
            
            if (fetchMessages) fetchMessages();
            toast.success(isSelf ? "UPLINK_TERMINATED" : "NODE_PURGED");
            setLoading(false);
        } catch {
            toast.error("PURGE_PROTOCOL_FAILED");
            setLoading(false);
        }
    };

    const adminName = currentChat.groupAdmin?.name 
        ? currentChat.groupAdmin.name.split(' ')[0] 
        : 'ADMIN';

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-[120] flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="manage-group-title"
            >
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={onClose} 
                    className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
                    aria-hidden="true"
                />

                {/* Modal Window */}
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-[#050505] border-2 border-green-500 font-mono shadow-[0_0_50px_rgba(34,197,94,0.3)] rounded-xl flex flex-col overflow-hidden z-10"
                >
                    {/* Header */}
                    <div className="bg-green-500 p-2.5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 text-black">
                            <Terminal size={14} strokeWidth={3} />
                            <span id="manage-group-title" className="text-[10px] font-black uppercase tracking-wider truncate max-w-[240px]">
                                MANAGE_NODE // {currentChat.chatName}
                            </span>
                        </div>
                        <button 
                            onClick={onClose} 
                            aria-label="Close Modal"
                            className="bg-black text-green-400 px-2 py-0.5 font-bold text-xs hover:bg-red-600 hover:text-white transition-all rounded"
                        >
                            [X]
                        </button>
                    </div>

                    <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar max-h-[75vh]">
                        
                        {/* SECTION 1: RENAME */}
                        <div className="space-y-1">
                            <label className="text-[8px] text-green-700 uppercase font-black tracking-widest">Update_Channel_Alias</label>
                            <div className="flex gap-1.5">
                                <input 
                                    className="flex-1 bg-black border border-zinc-800 p-2 text-green-300 text-xs outline-none focus:border-green-500 rounded"
                                    placeholder="NEW_ALIAS..."
                                    value={groupChatName}
                                    onChange={(e) => setGroupChatName(e.target.value)}
                                />
                                <button 
                                    onClick={handleRename}
                                    disabled={renameLoading || !groupChatName.trim()}
                                    className="bg-green-500/20 border border-green-500 text-green-400 px-3 text-xs hover:bg-green-500 hover:text-black font-black transition-all rounded disabled:opacity-40"
                                >
                                    {renameLoading ? "..." : "EXEC"}
                                </button>
                            </div>
                        </div>

                        {/* SECTION 2: MEMBER LIST */}
                        <div className="space-y-1.5">
                            <label className="text-[8px] text-green-700 uppercase font-black tracking-widest">Active_Subscribers</label>
                            <div className="flex flex-wrap gap-1.5 p-2 border border-zinc-900 min-h-[44px] bg-zinc-950/60 rounded">
                                {currentChat.users?.map((u) => (
                                    <div key={u._id} className="text-[10px] border border-green-500/40 text-green-300 px-2 py-1 flex items-center gap-1.5 bg-green-500/10 rounded">
                                        <span>{u.name}</span>
                                        {currentChat.groupAdmin?._id === user._id && u._id !== user._id && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(u)}
                                                className="text-red-400 hover:text-white"
                                                aria-label={`Remove ${u.name}`}
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SECTION 3: ADD MEMBERS */}
                        <div className="space-y-1">
                            <label className="text-[8px] text-green-700 uppercase font-black tracking-widest">Invite_New_Node</label>
                            <div className="relative">
                                <input 
                                    className="w-full bg-black border border-zinc-800 p-2 pl-8 text-green-300 text-xs outline-none focus:border-green-500 rounded"
                                    placeholder="SEARCH_REGISTRY..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-600" />
                            </div>
                            
                            {/* Search Results Mini-Panel */}
                            {searchResult.length > 0 && (
                                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto custom-scrollbar border border-zinc-900 rounded bg-black/80">
                                    {loading ? (
                                        <div className="text-[8px] text-green-700 animate-pulse py-2 text-center">SCANNING_REGISTRY...</div>
                                    ) : (
                                        searchResult.slice(0, 4).map((u) => (
                                            <div 
                                                key={u._id}
                                                onClick={() => handleAddUser(u)}
                                                className="p-2 border-b border-zinc-900/40 hover:bg-green-500/10 flex justify-between items-center cursor-pointer group transition-all"
                                            >
                                                <span className="text-[11px] text-zinc-400 group-hover:text-green-300">{u.name}</span>
                                                <UserPlus size={12} className="text-zinc-600 group-hover:text-green-400" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Action (Leave Group) */}
                    <div className="p-3 border-t border-zinc-900 bg-black flex justify-between items-center shrink-0">
                        <button 
                            onClick={() => handleRemove(user)}
                            className="flex items-center gap-1.5 text-[10px] text-red-500 font-black hover:text-red-400 transition-colors uppercase cursor-pointer"
                        >
                            <LogOut size={12} />
                            Terminate_Uplink
                        </button>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] text-green-800 uppercase font-bold">Admin_Node</span>
                            <span className="text-[10px] text-green-400 font-bold">{adminName}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpdateGroupChatModal;
