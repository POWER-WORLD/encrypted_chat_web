import React, { useEffect, useState, useMemo } from 'react';
import { useChatState } from '../context/ChatProvider';
import { getSender, getSenderFull } from '../config/chatLogics';
import axios from 'axios';
import GroupChatModal from '../ui/models/GroupChatModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const LeftSection = ({ isMobile, onClose }) => {
    const { chats, setChats, user, currentChat, setCurrentChat } = useChatState();
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchChats = async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/chats`, config);
            setChats(data);
        } catch (error) {
            console.error("FAILED_TO_SYNC_NODES", error);
        }
    };

    useEffect(() => {
        if (user) fetchChats();
    }, [user]);

    // Optimized filtering
    const filteredChats = useMemo(() => {
        return (chats || []).filter(chat => {
            const name = !chat.isGroupChat ? getSender(user, chat.users) : chat.chatName;
            return name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [chats, searchTerm, user]);

    if (!user) return null;

    return (
        <div className="w-full md:w-64 lg:w-72 border-r border-green-900/50 h-full flex flex-col bg-black select-none font-mono">
            {/* Header & Search */}
            <div className="p-4 border-b border-green-900/30 bg-zinc-950/40">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] text-green-500 tracking-[0.2em] font-black uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        ACTIVE_NODES
                    </span>
                    {isMobile && (
                        <button onClick={onClose} className="text-red-500 text-[9px] border border-red-900 px-1.5 py-0.5">EXIT</button>
                    )}
                </div>

                <div className="relative mb-3">
                    <input
                        type="text"
                        placeholder="FILTER_NETWORK..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-green-900/50 p-1.5 pl-7 text-[10px] text-green-400 outline-none focus:border-green-500 transition-all placeholder:text-green-900"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-green-900 text-[10px]">🔎</span>
                </div>

                <button
                    className="w-full text-[9px] py-2 border border-green-800 text-green-500 tracking-tighter uppercase font-bold hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-2"
                    onClick={() => setIsGroupOpen(true)}
                >
                    [+] NEW_GROUP_UPLINK
                </button>
            </div>

            {/* Chat List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {!chats ? (
                    <div className="p-8 text-center space-y-3">
                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-[8px] text-green-800 uppercase tracking-widest">Scanning_System_Registry...</p>
                    </div>
                ) : filteredChats.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-[9px] text-green-900 uppercase italic opacity-50">
                            {searchTerm ? "No nodes match filter." : "No connections found."}
                        </p>
                    </div>
                ) : (
                    filteredChats.map((chat) => (
                        <div
                            key={chat._id}
                            onClick={() => {
                                setCurrentChat(chat);
                                if (isMobile) onClose();
                            }}
                            className={`p-3 border-b border-green-900/10 cursor-pointer transition-all flex items-center gap-3 relative group ${currentChat?._id === chat._id
                                    ? "bg-green-500/10"
                                    : "hover:bg-green-500/5"
                                }`}
                        >
                            <div className={`absolute left-0 top-0 h-full w-[2px] ${currentChat?._id === chat._id ? 'bg-green-500' : 'bg-transparent'}`}></div>

                            <div className="shrink-0 relative">
                                <div className={`w-10 h-10 border p-0.5 bg-black ${currentChat?._id === chat._id ? 'border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'border-green-900/40'}`}>
                                    <img
                                        src={!chat.isGroupChat
                                            ? (getSenderFull(user, chat.users)?.profilePicture || `https://dicebear.com{chat._id}`)
                                            : (chat.groupImage || `https://dicebear.com{chat._id}`)
                                        }
                                        alt="node"
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all brightness-75 group-hover:brightness-100"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <span className={`text-[11px] font-bold uppercase tracking-tighter truncate ${currentChat?._id === chat._id ? "text-green-400" : "text-zinc-500"}`}>
                                        {!chat.isGroupChat ? getSender(user, chat.users) : chat.chatName}
                                    </span>
                                    {chat.latestMessage && (
                                        <span className="text-[7px] text-green-900 font-bold shrink-0 ml-1">
                                            {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[9px] text-zinc-600 truncate mt-0.5">
                                    {chat.latestMessage 
                                        ? `${chat.latestMessage.sender._id === user._id ? "YOU: " : ""}${chat.latestMessage.content}` 
                                        : "CH_OPEN_PENDING..."
                                    }
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 border-t border-green-900/30 bg-black text-[8px] text-green-900 flex justify-between font-mono uppercase">
                <span>USR: {user.name}</span>
                <span className="text-green-500">ONLINE</span>
            </div>

            <GroupChatModal isOpen={isGroupOpen} onClose={() => setIsGroupOpen(false)} />
        </div>
    );
};

export default LeftSection;
