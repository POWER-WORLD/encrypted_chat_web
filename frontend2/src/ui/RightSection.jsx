import React, { useEffect, useState, useRef } from 'react';
import { useChatState } from '../context/ChatProvider';
import axios from 'axios';
import io from 'socket.io-client';
import ProfileModal from '../ui/models/ProfileModal';
import UpdateGroupChatModal from '../ui/models/UpdateGroupChatModal';
import { getSender, getSenderFull } from '../config/chatLogics';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
let socket, selectedChatCompare;

const RightSection = () => {
    const { user, currentChat, setChats, chats, notification, setNotification } = useChatState();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef(null);

    // 1. Initialize Socket Connection
    useEffect(() => {
        socket = io(API_BASE_URL);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, [user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    // 2. Fetch messages when chat changes
    useEffect(() => {
        fetchMessages();
        // Keep track of the current chat to compare with incoming socket messages
        selectedChatCompare = currentChat;
    }, [currentChat]);

    // 3. Listen for real-time incoming messages and handle notifications
    useEffect(() => {
        socket.on("message received", (newMessageReceived) => {
            // If we are currently looking at the chat the message belongs to
            if (selectedChatCompare && selectedChatCompare._id === newMessageReceived.chat._id) {
                setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
            } else {
                // Logic for notification or updating sidebar latest message could go here
                setNotification((prev) => [...prev, newMessageReceived]);
                console.log("New message in background node...");
            }
        });

        // Remove listener to prevent memory leaks/duplicate messages
        return () => {
            socket.off("message received");
        };
    });

    // 4. Typing indicator logic (optional but adds to the "hacker vibe")
    useEffect(() => {
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        return () => {
            socket.off("typing");
            socket.off("stop typing");
        }
    }, []);

    // function to handle typing events
    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", currentChat._id);
        }

        let lastTypingTime = new Date().getTime();
        const timerLength = 3000; // 3 seconds
        setTimeout(() => {
            const timeNow = new Date().getTime();
            const timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", currentChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    // function to fetch messages for the selected chat
    const fetchMessages = async () => {
        if (!currentChat) return;

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/messages/${currentChat._id}`, config);

            setMessages(data);
            setLoading(false);

            // Join the specific room for this chat
            socket.emit("join chat", currentChat._id);
        } catch (error) {
            console.error("DECRYPTION_FAILED", error);
            setLoading(false);
        }
    };

    // function to send a new message
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
            };
            const messageContent = newMessage;
            setNewMessage("");

            const { data } = await axios.post(`${API_BASE_URL}/api/messages`, {
                content: messageContent,
                chatId: currentChat._id,
            }, config);

            // Emit the message to socket so other users get it
            socket.emit("new message", data);
            setMessages([...messages, data]);
        } catch (error) {
            console.error("TRANSMISSION_ERROR", error);
        }
    };

    return (
        <div className="flex-1 flex flex-col w-full min-w-0 h-full bg-gradient-to-b from-zinc-950 via-black to-zinc-900 font-mono relative shadow-2xl">
            {!currentChat ? (
                <div className="flex-1 flex items-center justify-center flex-col opacity-30">
                    <div className="w-20 h-20 border-4 border-green-500/30 rounded-full flex items-center justify-center animate-pulse mb-4 shadow-lg">
                        <span className="text-green-400 text-3xl">⚡</span>
                    </div>
                    <p className="text-lg tracking-[0.5em] text-green-400 font-bold uppercase">Awaiting Uplink</p>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="h-16 border-b border-green-900/30 flex items-center px-6 justify-between bg-black/80 backdrop-blur-md z-10 shadow-md">
                        <div className="flex items-center gap-4">
                            {/* Visual indicator for socket connection */}
                            <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_12px] ${socketConnected ? 'bg-green-400 shadow-green-400' : 'bg-red-500 shadow-red-500'}`}></div>
                            <div className="min-w-0">
                                <p className="text-xs text-green-700 font-bold uppercase leading-none mb-1 tracking-widest">NODE ACTIVE</p>
                                <p className="text-base font-extrabold text-green-200 uppercase tracking-tight truncate">
                                    {!currentChat.isGroupChat ? getSender(user, currentChat.users) : currentChat.chatName}
                                </p>
                            </div>
                        </div>

                        <button onClick={() => setIsModalOpen(true)} className="p-2 border border-green-900/50 hover:border-green-500 rounded-lg transition-colors shrink-0 bg-zinc-900/60 hover:bg-green-900/10">
                            <span className="text-green-400 text-xs font-black">{currentChat.isGroupChat ? "[GROUP CONFIG]" : "[USER ID]"}</span>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-black/60 to-zinc-900/80">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-green-400 text-xs md:text-sm animate-pulse font-bold uppercase tracking-widest">Decrypting Data Packets...</div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((m) => {
                                    const isMine = m.sender._id === user._id;
                                    return (
                                        <div key={m._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[10px] text-green-500 mb-1 uppercase font-bold tracking-widest">
                                                {isMine ? 'LOCAL OUTBOUND' : m.sender.name} [{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}]
                                            </span>
                                            <div className={`max-w-[85%] p-3 md:p-4 text-xs md:text-base shadow-2xl relative rounded-2xl ${isMine
                                                    ? "bg-green-600/30 border-r-4 border-green-400 text-green-300"
                                                    : "bg-zinc-500/30 border-l-4 border-zinc-500 text-zinc-200"
                                                }`}>
                                                {m.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                        {/* Typing Indicator */}
                        {isTyping ? (
                            <div className="flex items-center gap-2 mb-2 mt-2">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                                <span className="text-[10px] text-green-700 uppercase tracking-widest font-bold">
                                    Remote Node Transmitting...
                                </span>
                            </div>
                        ) : null}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 md:p-6 bg-black/80 border-t border-green-900/30">
                        <form onSubmit={sendMessage} className="flex items-center gap-3 bg-zinc-950 border border-green-900/50 p-3 rounded-xl focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-700/20 transition-all shadow-lg">
                            <span className="text-green-400 text-base font-black px-1">$</span>
                            <input
                                placeholder={isTyping ? "Node typing..." : "Type message here"}
                                value={newMessage}
                                onChange={typingHandler}
                                className="flex-1 bg-transparent outline-none text-base text-green-200 placeholder-green-700/50 px-2"
                            />
                            <button type="submit" className="text-green-400 hover:text-white px-3 py-2 rounded-lg bg-green-900/10 hover:bg-green-500/80 group transition-all shadow">
                                <span className="text-lg group-hover:translate-x-1 transition-transform inline-block">➤</span>
                            </button>
                        </form>
                    </div>

                    {/* Modals */}
                    {currentChat.isGroupChat ? (
                        <UpdateGroupChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} fetchMessages={fetchMessages} />
                    ) : (
                        <ProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={getSenderFull(user, currentChat.users)} />
                    )}
                </>
            )}
        </div>
    );
};

export default RightSection;
