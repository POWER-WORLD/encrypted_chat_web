import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useChatState } from '../context/ChatProvider';
import axios from 'axios';
import io from 'socket.io-client';
import ProfileModal from './modals/ProfileModal';
import UpdateGroupChatModal from './modals/UpdateGroupChatModal';
import { getSender, getSenderFull, formatMessageTime } from '../config/chatLogics';
import { API_BASE_URL } from '../config/constants';
import { Send, Terminal, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const RightSection = () => {
    const { user, currentChat, setNotification } = useChatState();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const socketRef = useRef(null);
    const selectedChatCompareRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Keep selected chat ref synchronized for socket event handlers
    useEffect(() => {
        selectedChatCompareRef.current = currentChat;
    }, [currentChat]);

    // 1. Initialize and Manage Socket Connection Lifecycle
    useEffect(() => {
        if (!user?._id) return;

        const socket = io(API_BASE_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        socketRef.current = socket;

        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));

        socket.on("typing", (room) => {
            if (selectedChatCompareRef.current && selectedChatCompareRef.current._id === room) {
                setIsTyping(true);
            }
        });

        socket.on("stop typing", (room) => {
            if (selectedChatCompareRef.current && selectedChatCompareRef.current._id === room) {
                setIsTyping(false);
            }
        });

        socket.on("message received", (newMessageReceived) => {
            const activeChat = selectedChatCompareRef.current;
            if (activeChat && activeChat._id === newMessageReceived.chat?._id) {
                setMessages((prevMessages) => {
                    // Message deduplication
                    if (prevMessages.some((m) => m._id === newMessageReceived._id)) {
                        return prevMessages;
                    }
                    return [...prevMessages, newMessageReceived];
                });
            } else {
                // Incoming message for another chat -> Notification
                setNotification((prev) => {
                    if (prev.some((n) => n._id === newMessageReceived._id)) {
                        return prev;
                    }
                    return [newMessageReceived, ...prev];
                });
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user, setNotification]);

    // 2. Fetch Messages when currentChat changes
    const fetchMessages = useCallback(async () => {
        if (!currentChat?._id || !user?.token) return;

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/messages/${currentChat._id}`, config);

            setMessages(Array.isArray(data) ? data : []);
            setLoading(false);

            // Join the specific room for this chat
            if (socketRef.current) {
                socketRef.current.emit("join chat", currentChat._id);
            }
        } catch {
            toast.error("Failed to decrypt conversation history");
            setLoading(false);
        }
    }, [currentChat?._id, user?.token]);

    useEffect(() => {
        fetchMessages();
        setIsTyping(false);
    }, [fetchMessages]);

    // Auto-scroll to bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // 3. Typing event handling with clean debouncing
    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if (!socketConnected || !socketRef.current || !currentChat?._id) return;

        socketRef.current.emit("typing", currentChat._id);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (socketRef.current && currentChat?._id) {
                socketRef.current.emit("stop typing", currentChat._id);
            }
        }, 2000);
    };

    // 4. Send Message Handler
    const sendMessage = async (e) => {
        e.preventDefault();
        const contentToSend = newMessage.trim();
        if (!contentToSend || !currentChat?._id) return;

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (socketRef.current) socketRef.current.emit("stop typing", currentChat._id);
        
        setNewMessage("");

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
            };

            const { data } = await axios.post(`${API_BASE_URL}/api/messages`, {
                content: contentToSend,
                chatId: currentChat._id,
            }, config);

            // Emit through socket for real-time delivery to peer
            if (socketRef.current) {
                socketRef.current.emit("new message", data);
            }

            // Deduplicate and append local state
            setMessages((prev) => {
                if (prev.some((m) => m._id === data._id)) return prev;
                return [...prev, data];
            });
        } catch {
            toast.error("Packet transmission error");
        }
    };

    const peerName = !currentChat?.isGroupChat 
        ? getSender(user, currentChat?.users) 
        : (currentChat?.chatName || "Encrypted Group");

    return (
        <div className="flex-1 flex flex-col w-full min-w-0 h-full bg-[#050505] font-mono relative shadow-2xl">
            {!currentChat ? (
                <div className="flex-1 flex items-center justify-center flex-col opacity-40 p-6 text-center select-none">
                    <div className="w-20 h-20 border-2 border-green-500/40 rounded-full flex items-center justify-center animate-pulse mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                        <Zap size={32} className="text-green-400" />
                    </div>
                    <p className="text-sm tracking-[0.4em] text-green-400 font-bold uppercase mb-2">Awaiting Uplink</p>
                    <p className="text-xs text-zinc-500 max-w-xs font-sans">
                        Select a channel from the sidebar or search a node to establish an encrypted transmission session.
                    </p>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <header className="h-16 border-b border-green-900/40 flex items-center px-4 sm:px-6 justify-between bg-zinc-950/90 backdrop-blur-md z-10">
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                            {/* Socket Status Indicator */}
                            <span 
                                title={socketConnected ? "Socket Online" : "Reconnecting Socket"}
                                className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px] ${
                                    socketConnected ? 'bg-green-400 shadow-green-400 animate-pulse' : 'bg-red-500 shadow-red-500'
                                }`}
                            />
                            <div className="min-w-0">
                                <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest leading-none mb-1">
                                    {currentChat.isGroupChat ? 'CLUSTER NODE' : 'PEER LINK'}
                                </p>
                                <h2 className="text-sm sm:text-base font-extrabold text-green-200 tracking-tight truncate">
                                    {peerName}
                                </h2>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            className="px-3 py-1.5 border border-green-500/50 hover:border-green-400 rounded text-xs font-mono font-bold text-green-400 hover:bg-green-500/10 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                        >
                            <Terminal size={12} />
                            <span>{currentChat.isGroupChat ? "CLUSTER_CONFIG" : "NODE_INFO"}</span>
                        </button>
                    </header>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-black/60 space-y-4">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-green-400 text-xs animate-pulse font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Shield size={16} className="animate-spin" /> Decrypting Data Packets...
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
                                [CHANNEL_READY: No prior communications logged]
                            </div>
                        ) : (
                            messages.map((m, idx) => {
                                const isMine = m.sender?._id === user._id;
                                const senderName = isMine ? 'LOCAL' : (m.sender?.name || 'REMOTE');
                                
                                return (
                                    <div 
                                        key={m._id || `msg-${idx}`} 
                                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className="flex items-center gap-2 text-[9px] text-zinc-500 mb-1 font-mono uppercase tracking-wider">
                                            <span className={isMine ? 'text-green-500 font-bold' : 'text-zinc-400'}>
                                                {senderName}
                                            </span>
                                            <span>[{formatMessageTime(m.createdAt)}]</span>
                                        </div>
                                        <div 
                                            className={`max-w-[85%] sm:max-w-[75%] p-3 text-xs sm:text-sm rounded-xl break-words shadow-lg ${
                                                isMine
                                                    ? "bg-green-950/40 border border-green-500/40 text-green-200 rounded-tr-none"
                                                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none"
                                            }`}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Remote Typing Indicator */}
                        {isTyping && (
                            <div className="flex items-center gap-2 pt-2">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                                <span className="text-[9px] text-green-600 uppercase tracking-widest font-mono">
                                    Peer transmitting packet stream...
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input Bar */}
                    <div className="p-3 sm:p-4 bg-zinc-950 border-t border-green-900/30">
                        <form onSubmit={sendMessage} className="flex items-center gap-2 bg-black border border-green-900/60 focus-within:border-green-500/80 p-2 rounded-xl transition-all shadow-inner">
                            <span className="text-green-500 font-bold text-sm px-2 select-none">$</span>
                            <input
                                placeholder={isTyping ? "Peer node is typing..." : "Transmit encrypted payload..."}
                                value={newMessage}
                                onChange={typingHandler}
                                aria-label="Message Payload Input"
                                className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-green-300 placeholder:text-zinc-600 px-1 font-mono"
                            />
                            <button 
                                type="submit" 
                                disabled={!newMessage.trim()}
                                aria-label="Send message"
                                className="text-black bg-green-500 hover:bg-green-400 disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-600 p-2 rounded-lg transition-all cursor-pointer shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                            >
                                <Send size={15} />
                            </button>
                        </form>
                    </div>

                    {/* Modals */}
                    {currentChat.isGroupChat ? (
                        <UpdateGroupChatModal 
                            isOpen={isModalOpen} 
                            onClose={() => setIsModalOpen(false)} 
                            fetchMessages={fetchMessages} 
                        />
                    ) : (
                        <ProfileModal 
                            isOpen={isModalOpen} 
                            onClose={() => setIsModalOpen(false)} 
                            user={getSenderFull(user, currentChat.users)} 
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default RightSection;
