import React, { useState } from 'react';
import { useChatState } from '../../context/ChatProvider';
import { Search, X, UserPlus, LogOut, Terminal } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const UpdateGroupChatModal = ({ isOpen, onClose, fetchMessages }) => {
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);

    const { currentChat, setCurrentChat, user } = useChatState();

    if (!isOpen || !currentChat) return null;

    // --- SEARCH FOR NEW USERS ---
    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) return setSearchResult([]);
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/users?search=${query}`, config);
            setSearchResult(data);
        } catch (e) {
            toast.error("SEARCH_PROTOCOL_FAILED");
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATE GROUP NAME ---
    const handleRename = async () => {
        if (!groupChatName) return;
        try {
            setRenameLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API_BASE_URL}/api/chats/group`, {
                chatId: currentChat._id,
                chatName: groupChatName,
            }, config);

            setCurrentChat(data);
            setGroupChatName("");
            setRenameLoading(false);
            toast.success("ALIAS_UPDATED");
        } catch (error) {
            toast.error("RENAME_REJECTED");
            setRenameLoading(false);
        }
    };

    // --- ADD USER TO GROUP ---
    const handleAddUser = async (user1) => {
        if (currentChat.users.find((u) => u._id === user1._id)) return toast.error("NODE_ALREADY_CONNECTED");
        if (currentChat.groupAdmin._id !== user._id) return toast.error("ADMIN_PRIVILEGES_REQUIRED");

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API_BASE_URL}/api/chats/group/add`, {
                chatId: currentChat._id,
                userId: user1._id,
            }, config);

            setCurrentChat(data);
            setLoading(false);
            toast.success("NODE_LINKED");
        } catch (error) {
            toast.error("UPLINK_DENIED");
            setLoading(false);
        }
    };

    // --- REMOVE USER OR LEAVE GROUP ---
    const handleRemove = async (user1) => {
        // Admin can remove anyone; non-admins can only remove themselves (leave)
        if (currentChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            return toast.error("ADMIN_PRIVILEGES_REQUIRED");
        }

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API_BASE_URL}/api/chats/group/remove`, {
                chatId: currentChat._id,
                userId: user1._id,
            }, config);

            // If user removed themselves, exit the chat view
            user1._id === user._id ? setCurrentChat() : setCurrentChat(data);
            
            if (fetchMessages) fetchMessages();
            toast.success(user1._id === user._id ? "UPLINK_TERMINATED" : "NODE_PURGED");
            setLoading(false);
        } catch (error) {
            toast.error("PURGE_PROTOCOL_FAILED");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            {/* Modal Window */}
            <div className="w-full max-w-sm bg-[#050505] border-2 border-green-500 font-mono shadow-[0_0_100px_rgba(0,0,0,1)] pointer-events-auto flex flex-col overflow-hidden">
                
                {/* Header (Drag Bar Style) */}
                <div className="bg-green-500 p-2 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2 text-black">
                        <Terminal size={14} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase">MANAGE_NODE // {currentChat.chatName}</span>
                    </div>
                    <button onClick={onClose} className="bg-black text-green-500 px-2 font-bold text-xs hover:bg-red-600 hover:text-white transition-all">
                        [X]
                    </button>
                </div>

                <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar">
                    
                    {/* SECTION 1: RENAME */}
                    <div className="space-y-1">
                        <label className="text-[8px] text-green-900 uppercase font-black tracking-widest">Update_Channel_Alias</label>
                        <div className="flex gap-1">
                            <input 
                                className="flex-1 bg-black border border-green-900/50 p-2 text-green-400 text-[11px] outline-none focus:border-green-500"
                                placeholder="NEW_ALIAS..."
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <button 
                                onClick={handleRename}
                                disabled={renameLoading}
                                className="bg-green-900/20 border border-green-500 text-green-500 px-4 text-[10px] hover:bg-green-500 hover:text-black font-black transition-all"
                            >
                                {renameLoading ? "..." : "EXEC"}
                            </button>
                        </div>
                    </div>

                    {/* SECTION 2: MEMBER LIST */}
                    <div className="space-y-2">
                        <label className="text-[8px] text-green-900 uppercase font-black tracking-widest">Active_Subscribers</label>
                        <div className="flex flex-wrap gap-1 p-2 border border-green-900/20 min-h-[40px] bg-zinc-950/30">
                            {currentChat.users.map((u) => (
                                <div key={u._id} className="text-[9px] border border-green-500/40 text-green-500 px-2 py-1 flex items-center gap-2 bg-green-500/5 group">
                                    {u.name}
                                    {/* Show purge icon if current user is admin AND u is not current user */}
                                    {currentChat.groupAdmin._id === user._id && u._id !== user._id && (
                                        <X 
                                            size={12} 
                                            className="cursor-pointer text-red-900 hover:text-red-500" 
                                            onClick={() => handleRemove(u)} 
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 3: ADD MEMBERS */}
                    <div className="space-y-1">
                        <label className="text-[8px] text-green-900 uppercase font-black tracking-widest">Invite_New_Node</label>
                        <div className="relative">
                            <input 
                                className="w-full bg-black border border-green-900/50 p-2 pl-8 text-green-400 text-[11px] outline-none focus:border-green-500"
                                placeholder="SEARCH_DATABASE..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <Search size={14} className="absolute left-2.5 top-2.5 text-green-900" />
                        </div>
                        
                        {/* Search Results Mini-Panel */}
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {loading ? (
                                <div className="text-[8px] text-green-900 animate-pulse py-2">SCANNING_REGISTRY...</div>
                            ) : (
                                searchResult.slice(0, 3).map((u) => (
                                    <div 
                                        key={u._id}
                                        onClick={() => handleAddUser(u)}
                                        className="p-2 border border-green-900/10 hover:border-green-500 bg-black flex justify-between items-center cursor-pointer group transition-all"
                                    >
                                        <span className="text-[10px] text-zinc-500 group-hover:text-green-400">{u.name}</span>
                                        <UserPlus size={12} className="text-green-900 group-hover:text-green-500" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Action (Leave Group) */}
                <div className="p-3 border-t border-green-900/30 bg-black flex justify-between items-center shrink-0">
                    <button 
                        onClick={() => handleRemove(user)}
                        className="flex items-center gap-2 text-[9px] text-red-600 font-black hover:text-red-400 transition-colors uppercase"
                    >
                        <LogOut size={12} />
                        Terminate_Uplink
                    </button>
                    <div className="flex flex-col items-end">
                        <span className="text-[7px] text-green-900 uppercase font-bold">Admin_Node</span>
                        <span className="text-[9px] text-green-500 font-bold">{currentChat.groupAdmin.name.split(' ')[0]}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateGroupChatModal;
