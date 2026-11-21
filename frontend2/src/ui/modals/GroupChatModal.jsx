import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatState } from '../../context/ChatProvider';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL, getAvatarUrl } from '../../config/constants';
import { Users, X } from 'lucide-react';

const GroupChatModal = ({ isOpen, onClose }) => {
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { user, chats, setChats, setCurrentChat } = useChatState();

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    const handleSearch = async (query) => {
        setSearch(query);
        const trimmed = query.trim();
        if (!trimmed) {
            setSearchResult([]);
            return;
        }

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/users?search=${encodeURIComponent(trimmed)}`, config);
            setLoading(false);
            setSearchResult(Array.isArray(data) ? data : []);
        } catch {
            setLoading(false);
            toast.error("NODE_LOOKUP_FAILED");
        }
    };

    const handleGroup = (userToAdd) => {
        if (selectedUsers.some((u) => u._id === userToAdd._id)) {
            return toast.error("Node already selected");
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };

    const handleSubmit = async () => {
        const trimmedName = groupChatName.trim();
        if (!trimmedName || selectedUsers.length < 2) {
            return toast.error("REQUIREMENTS: Name + minimum 2 nodes required");
        }

        try {
            setSubmitting(true);
            const config = { 
                headers: { 
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}` 
                } 
            };
            const { data } = await axios.post(
                `${API_BASE_URL}/api/chats/group`,
                {
                    name: trimmedName,
                    users: JSON.stringify(selectedUsers.map((u) => u._id)),
                },
                config
            );
            
            setChats([data, ...chats]);
            setCurrentChat(data);
            
            // Reset state and close modal
            setGroupChatName("");
            setSelectedUsers([]);
            setSearch("");
            setSearchResult([]);
            setSubmitting(false);
            
            toast.success("Group Uplink Established");
            onClose();
        } catch (error) {
            setSubmitting(false);
            const msg = error.response?.data?.message || "GROUP_CREATION_FAILED";
            toast.error(msg);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="group-modal-title"
                >
                    <motion.div
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onClose} 
                        className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
                        aria-hidden="true"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }} 
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.2)] font-mono rounded-xl overflow-hidden z-10"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center bg-green-500/10 px-4 py-3 border-b border-green-500/30">
                            <span id="group-modal-title" className="text-xs font-bold text-green-400 tracking-[0.25em] flex items-center gap-2">
                                <Users size={14} className="text-green-400" />
                                CREATE_GROUP_UPLINK
                            </span>
                            <button 
                                onClick={onClose} 
                                aria-label="Close Modal"
                                className="text-zinc-400 hover:text-red-400 font-bold text-xs"
                            >
                                [ESC]
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Group Name Input */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] text-green-700 uppercase tracking-widest font-black">Channel_Alias</label>
                                <input
                                    className="w-full bg-black border border-zinc-800 p-2.5 text-green-300 text-xs focus:border-green-500 rounded outline-none font-mono"
                                    placeholder="Enter Group Name..."
                                    value={groupChatName}
                                    onChange={(e) => setGroupChatName(e.target.value)}
                                />
                            </div>

                            {/* User Search Input */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] text-green-700 uppercase tracking-widest font-black">Search_Nodes</label>
                                <input
                                    className="w-full bg-black border border-zinc-800 p-2.5 text-green-300 text-xs focus:border-green-500 rounded outline-none font-mono"
                                    placeholder="Search by Handle or Email..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>

                            {/* Selected Users (Badges) */}
                            {selectedUsers.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar p-1">
                                    {selectedUsers.map((u) => (
                                        <div key={u._id} className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/40 px-2 py-1 rounded text-xs">
                                            <span className="text-[10px] text-green-300">{u.name}</span>
                                            <button 
                                                onClick={() => handleDelete(u)} 
                                                className="text-red-400 hover:text-red-300 ml-1"
                                                aria-label={`Remove ${u.name}`}
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search Results */}
                            <div className="max-h-36 overflow-y-auto custom-scrollbar border border-zinc-900 rounded bg-black/60">
                                {loading ? (
                                    <div className="p-4 text-center text-[10px] text-green-600 animate-pulse">QUERYING_SYSTEM_REGISTRY...</div>
                                ) : searchResult.length === 0 && search.trim() ? (
                                    <div className="p-3 text-center text-[10px] text-zinc-600">No nodes found</div>
                                ) : (
                                    searchResult.slice(0, 5).map((u) => (
                                        <div
                                            key={u._id}
                                            onClick={() => handleGroup(u)}
                                            className="p-2 border-b border-zinc-900/60 hover:bg-green-500/10 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full border border-green-900 p-0.5 overflow-hidden shrink-0">
                                                <img src={getAvatarUrl(u, u.name)} alt="node" className="w-full h-full grayscale rounded-full" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs text-green-300 font-bold truncate">{u.name}</span>
                                                <span className="text-[9px] text-zinc-500 font-mono truncate">{u.email}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !groupChatName.trim() || selectedUsers.length < 2}
                                className={`w-full py-3 border font-bold text-xs transition-all tracking-widest rounded uppercase ${
                                    submitting || !groupChatName.trim() || selectedUsers.length < 2
                                        ? "border-zinc-800 text-zinc-600 cursor-not-allowed bg-zinc-950"
                                        : "border-green-500 text-black bg-green-500 hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer"
                                }`}
                            >
                                {submitting ? "[ ESTABLISHING... ]" : "[ INITIATE_GROUP_UPLINK ]"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GroupChatModal;
