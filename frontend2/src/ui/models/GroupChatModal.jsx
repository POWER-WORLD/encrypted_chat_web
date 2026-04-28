import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatState } from '../../context/ChatProvider';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const GroupChatModal = ({ isOpen, onClose }) => {
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const { user, chats, setChats } = useChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            setSearchResult([]);
            return;
        }

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/users?search=${query}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            console.error("SEARCH_FAILED");
            setLoading(false);
        }
    };

    const handleGroup = (userToAdd) => {
        if (selectedUsers.find((u) => u._id === userToAdd._id)) return;
        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };

    const handleSubmit = async () => {
        if (!groupChatName || selectedUsers.length < 2) {
            alert("MINIMUM_REQUIREMENTS: Name + 2 Users");
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(
                `${API_BASE_URL}/api/chats/group`,
                {
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map((u) => u._id)),
                },
                config
            );
            setChats([data, ...chats]);
            // Reset state and close modal
            setGroupChatName("");
            setSelectedUsers([]);
            setSearch("");       // Clears the input text
            setSearchResult([]); // Clears the list of users found
            onClose();
        } catch (error) {
            console.error("UPLOAD_FAILED");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-md bg-black border border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.2)] font-mono"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center bg-green-500/10 px-4 py-2 border-b border-green-500/30">
                            <span className="text-[10px] font-bold text-green-500 tracking-[0.3em]">CREATE_GROUP_UPLINK</span>
                            <button onClick={onClose} className="text-green-500 hover:text-red-500 transition-colors">[X]</button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Group Name Input */}
                            <div className="space-y-2">
                                <label className="text-[8px] text-green-900 uppercase">Uplink_Name</label>
                                <input
                                    className="w-full bg-zinc-950 border border-green-900/50 p-2 text-green-500 text-xs focus:border-green-500 outline-none"
                                    placeholder="Enter Group Name..."
                                    onChange={(e) => setGroupChatName(e.target.value)}
                                />
                            </div>

                            {/* User Search Input */}
                            <div className="space-y-2">
                                <label className="text-[8px] text-green-900 uppercase">Find_Nodes</label>
                                <input
                                    className="w-full bg-zinc-950 border border-green-900/50 p-2 text-green-500 text-xs focus:border-green-500 outline-none"
                                    placeholder="Search by Name/Email..."
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>

                            {/* Selected Users (Tags) */}
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map((u) => (
                                    <div key={u._id} className="flex items-center gap-2 bg-green-900/20 border border-green-500/50 px-2 py-1">
                                        <span className="text-[10px] text-green-400">{u.name}</span>
                                        <button onClick={() => handleDelete(u)} className="text-[10px] text-red-500 hover:text-white">x</button>
                                    </div>
                                ))}
                            </div>

                            {/* Search Results */}
                            <div className="max-h-40 overflow-y-auto custom-scrollbar border border-green-900/20">
                                {loading ? (
                                    <div className="p-4 text-center text-[10px] text-green-900 animate-pulse">SCANNING_DATABASE...</div>
                                ) : (
                                    searchResult?.slice(0, 4).map((u) => (
                                        <div
                                            key={u._id}
                                            onClick={() => handleGroup(u)}
                                            className="p-2 border-b border-green-900/10 hover:bg-green-500/10 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 border border-green-900 p-0.5">
                                                <img src={u.profilePicture} alt="node" className="w-full h-full grayscale" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] text-green-400">{u.name}</span>
                                                <span className="text-[8px] text-green-900 font-mono">{u.email}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!groupChatName || selectedUsers.length < 2}
                                className={`w-full py-3 border font-bold text-[10px] transition-all tracking-[0.2em] ${!groupChatName || selectedUsers.length < 2
                                        ? "border-zinc-800 text-zinc-800 cursor-not-allowed"
                                        : "border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                                    }`}
                            >
                                [ INITIATE_GROUP_UPLINK ]
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GroupChatModal;
