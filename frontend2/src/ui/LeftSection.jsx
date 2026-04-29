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
        <div className="w-full md:w-72 lg:w-80 border-r border-green-900/50 h-full flex flex-col bg-gradient-to-b from-zinc-950 via-black to-zinc-900 select-none font-mono shadow-xl">
            {/* Header & Search */}
            <div className="p-4 border-b border-green-900/30 bg-zinc-950/60 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-green-400 tracking-[0.2em] font-black uppercase flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg"></span>
                        ACTIVE_NODES
                    </span>
                    {isMobile && (
                        <button onClick={onClose} className="text-red-400 text-xs border border-red-900 px-2 py-1 rounded-lg hover:bg-red-900/30 transition-all">EXIT</button>
                    )}
                </div>

                <div className="relative mb-3">
                    <input
                        type="text"
                        placeholder="Filter network..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900/80 border border-green-900/50 p-2 pl-9 text-xs text-green-300 rounded-lg outline-none focus:border-green-400 focus:ring-2 focus:ring-green-700/30 transition-all placeholder:text-green-900 shadow-inner"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 text-xs pointer-events-none">🔍</span>
                </div>

                <button
                    className="w-full text-xs py-2 border border-green-700 text-green-400 tracking-tighter uppercase font-bold rounded-lg hover:bg-green-500 hover:text-black hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow"
                    onClick={() => setIsGroupOpen(true)}
                >
                    <span className="text-lg leading-none">+</span> New Group Uplink
                </button>
            </div>

            {/* Chat List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-black/60 to-zinc-900/80">
                {!chats ? (
                    <div className="p-8 text-center space-y-3">
                        <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] text-green-700 uppercase tracking-widest">Scanning System Registry...</p>
                    </div>
                ) : filteredChats.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-xs text-green-900 uppercase italic opacity-50">
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
                            className={`p-3 border-b border-green-900/10 cursor-pointer transition-all flex items-center gap-3 relative group rounded-lg mx-2 my-1 ${currentChat?._id === chat._id
                                    ? "bg-green-500/15 shadow-lg"
                                    : "hover:bg-green-500/10 hover:shadow"
                                }`}
                        >
                            <div className={`absolute left-0 top-0 h-full w-[3px] rounded-r-lg ${currentChat?._id === chat._id ? 'bg-green-400' : 'bg-transparent'}`}></div>

                            <div className="shrink-0 relative">
                                <div className={`w-12 h-12 border-2 p-0.5 bg-zinc-900 rounded-full flex items-center justify-center ${currentChat?._id === chat._id ? 'border-green-400 shadow-[0_0_16px_rgba(34,197,94,0.3)]' : 'border-green-900/40'}`}>
                                    <img
                                        src={!chat.isGroupChat
                                            ? (getSenderFull(user, chat.users)?.profilePicture || `https://api.dicebear.com/7.x/identicon/svg?seed=${chat._id}`)
                                            : (chat.groupImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${chat._id}`)
                                        }
                                        alt="node"
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all brightness-75 group-hover:brightness-100 rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <span className={`text-[13px] font-bold uppercase tracking-tighter truncate ${currentChat?._id === chat._id ? "text-green-400" : "text-zinc-300"}`}>
                                        {!chat.isGroupChat ? getSender(user, chat.users) : chat.chatName}
                                    </span>
                                    {chat.latestMessage && (
                                        <span className="text-[9px] text-green-900 font-bold shrink-0 ml-1">
                                            {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
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


            <div className="p-4 border-t border-green-900/30 bg-black/80 text-[10px] text-green-900 flex justify-between font-mono uppercase items-center">
                <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="font-bold text-green-300">{user.name}</span>
                </span>
                <span className="text-green-500 font-bold tracking-wider">ONLINE</span>
            </div>

            <GroupChatModal isOpen={isGroupOpen} onClose={() => setIsGroupOpen(false)} />
        </div>
    );
};

export default LeftSection;
