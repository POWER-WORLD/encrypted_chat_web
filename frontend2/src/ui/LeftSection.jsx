import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useChatState } from '../context/ChatProvider';
import { getSender, getSenderFull, formatMessageTime } from '../config/chatLogics';
import axios from 'axios';
import GroupChatModal from './modals/GroupChatModal';
import { API_BASE_URL, getAvatarUrl } from '../config/constants';
import { Search, Plus, X } from 'lucide-react';

const LeftSection = ({ isMobile, onClose }) => {
    const { chats, setChats, user, currentChat, setCurrentChat } = useChatState();
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [syncing, setSyncing] = useState(false);

    const fetchChats = useCallback(async () => {
        if (!user?.token) return;
        try {
            setSyncing(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/chats`, config);
            setChats(Array.isArray(data) ? data : []);
            setSyncing(false);
        } catch (error) {
            console.error("FAILED_TO_SYNC_NODES", error);
            setSyncing(false);
        }
    }, [user?.token, setChats]);

    useEffect(() => {
        if (user) {
            fetchChats();
        }
    }, [user, fetchChats]);

    // Optimized filtering
    const filteredChats = useMemo(() => {
        if (!Array.isArray(chats)) return [];
        return chats.filter((chat) => {
            const name = !chat.isGroupChat 
                ? getSender(user, chat.users) 
                : (chat.chatName || "");
            return name.toLowerCase().includes(searchTerm.toLowerCase().trim());
        });
    }, [chats, searchTerm, user]);

    if (!user) return null;

    return (
        <div className="w-full md:w-72 lg:w-80 border-r border-green-900/40 h-full flex flex-col bg-zinc-950 font-mono select-none shadow-xl">
            {/* Header & Search */}
            <div className="p-3.5 border-b border-green-900/30 bg-black/60">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-green-400 tracking-[0.2em] font-black uppercase flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                        ACTIVE_NODES
                    </span>
                    {isMobile && (
                        <button 
                            onClick={onClose} 
                            aria-label="Close sidebar"
                            className="text-red-400 text-xs border border-red-900/60 p-1 rounded hover:bg-red-900/30 transition-all"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="relative mb-2.5">
                    <input
                        type="text"
                        placeholder="Filter channels..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900/80 border border-green-900/50 p-2 pl-8 text-xs text-green-300 rounded-lg outline-none focus:border-green-400 transition-all placeholder:text-zinc-600 font-mono"
                    />
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                </div>

                <button
                    className="w-full text-xs py-2 border border-green-500/60 text-green-400 font-bold rounded-lg hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.1)] active:scale-98 cursor-pointer"
                    onClick={() => setIsGroupOpen(true)}
                >
                    <Plus size={14} /> New Group Uplink
                </button>
            </div>

            {/* Chat List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40">
                {syncing && (!chats || chats.length === 0) ? (
                    <div className="p-8 text-center space-y-3">
                        <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] text-green-700 uppercase tracking-widest">Scanning Registry...</p>
                    </div>
                ) : filteredChats.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-xs text-zinc-600 uppercase font-mono italic">
                            {searchTerm ? "No node matching filter" : "No active channels"}
                        </p>
                    </div>
                ) : (
                    filteredChats.map((chat) => {
                        const isCurrent = currentChat?._id === chat._id;
                        const peerUser = !chat.isGroupChat ? getSenderFull(user, chat.users) : null;
                        const displayName = !chat.isGroupChat 
                            ? getSender(user, chat.users) 
                            : (chat.chatName || "Encrypted Group");
                        
                        return (
                            <div
                                key={chat._id}
                                onClick={() => {
                                    setCurrentChat(chat);
                                    if (isMobile && onClose) onClose();
                                }}
                                className={`p-2.5 border-b border-zinc-900/80 cursor-pointer transition-all flex items-center gap-2.5 relative group rounded-lg mx-1.5 my-1 ${
                                    isCurrent
                                        ? "bg-green-500/15 border-green-500/40 shadow-md"
                                        : "hover:bg-zinc-900/70"
                                }`}
                            >
                                {isCurrent && (
                                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-green-400 rounded-r"></div>
                                )}

                                <div className="shrink-0 relative">
                                    <div className={`w-10 h-10 border rounded-full overflow-hidden p-0.5 bg-black ${
                                        isCurrent ? 'border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'border-zinc-800'
                                    }`}>
                                        <img
                                            src={getAvatarUrl(peerUser || chat, displayName)}
                                            alt={displayName}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-bold truncate ${
                                            isCurrent ? "text-green-300" : "text-zinc-300 group-hover:text-green-400"
                                        }`}>
                                            {displayName}
                                        </span>
                                        {chat.latestMessage?.createdAt && (
                                            <span className="text-[9px] text-zinc-600 font-mono shrink-0 ml-1">
                                                {formatMessageTime(chat.latestMessage.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                                        {chat.latestMessage ? (
                                            <>
                                                {chat.latestMessage.sender?._id === user._id ? (
                                                    <span className="text-green-500/80 font-bold">YOU: </span>
                                                ) : chat.isGroupChat && chat.latestMessage.sender?.name ? (
                                                    <span className="text-zinc-400">{chat.latestMessage.sender.name.split(' ')[0]}: </span>
                                                ) : null}
                                                {chat.latestMessage.content}
                                            </>
                                        ) : (
                                            <span className="text-zinc-600 italic">Channel standby...</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bottom Status Indicator */}
            <div className="p-3 border-t border-green-900/30 bg-black/90 text-[10px] text-zinc-500 flex justify-between font-mono items-center">
                <span className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                    <span className="font-bold text-green-400 truncate">{user.name}</span>
                </span>
                <span className="text-green-500 font-bold tracking-widest shrink-0">ONLINE</span>
            </div>

            <GroupChatModal isOpen={isGroupOpen} onClose={() => setIsGroupOpen(false)} />
        </div>
    );
};

export default LeftSection;
