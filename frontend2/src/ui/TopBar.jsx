import React, { useEffect, useState } from 'react';
import { useChatState } from '../context/ChatProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import ProfileModal from './models/ProfileModal';
import SettingsModal from './models/SettingsModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const TopBar = ({ onMenuToggle }) => {

    const { user, setUser, setCurrentChat, chats, setChats, notification, setNotification } = useChatState();
    const [search, setSearch] = useState('');
    const searchRef = React.useRef(null);
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResult([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        setUser(null);
        setIsMenuOpen(false);
        navigate('/');
    };

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            setSearchResult([]);
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            // Replace with your actual search endpoint
            const { data } = await axios.get(`${VITE_API_BASE_URL}/api/users?search=${query}`, config);
            setLoading(false);
            setSearchResult(data.slice(0, 10)); // Limit to 10 results
        } catch (error) {
            console.error("Failed to load search results");
            setLoading(false);
        }
    };

    const accessChat = async (userId) => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`${VITE_API_BASE_URL}/api/chats`, { userId }, config);
            if (!chats.find((chat) => chat._id === data._id)) {
                setChats([data, ...chats]);
            }
            // Assuming you have a way to set the current chat in your context
            setCurrentChat(data);
            setSearch('');
            setLoading(false);
        } catch (error) {
            console.error("Failed to access chat");
            setLoading(false);
        }
    };

    return (
        <>

            <header className="relative bg-gradient-to-r from-black via-zinc-900 to-black select-none z-[100] shadow-2xl">
                {/* Visual Scanning Effect */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-green-400/60 via-green-500/80 to-green-400/60 shadow-[0_0_24px_#22c55e] z-50 animate-pulse"></div>

                <div className="h-20 md:h-20 border-b border-green-500/20 flex items-center justify-between px-2 sm:px-4 md:px-10 transition-all duration-300">
                    {/* LEFT: Logo */}
                    <div className="flex items-center gap-2 sm:gap-5 py-2 md:py-0">
                        <button onClick={onMenuToggle} className="md:hidden px-4 py-2 border border-green-500/60 text-green-400 font-mono text-sm rounded-xl hover:bg-green-500/10 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow">
                            <span className="tracking-widest">[ MENU ]</span>
                        </button>
                        <h1 className="text-lg md:text-3xl font-black tracking-[0.25em] text-green-400 drop-shadow-2xl uppercase select-text">MSG_CRYPT</h1>
                    </div>

                    {/* CENTER: Search Section */}
                    <div ref={searchRef} className="hidden sm:flex flex-1 min-w-[200px] max-w-xl mx-2 md:mx-10 relative group">
                        <div className="relative flex w-full bg-black/80 border border-green-500/40 items-center focus-within:border-green-400 rounded-xl shadow-inner overflow-hidden transition-all">
                            <span className="pl-4">
                                <Search className="w-5 h-5 text-green-900" />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full bg-transparent px-4 py-3 text-base text-green-200 focus:outline-none font-mono placeholder:text-green-900/60"
                                placeholder="Search node..."
                            />
                            {loading && <div className="pr-4 text-base text-green-400 animate-pulse">...</div>}
                        </div>

                        {/* SEARCH RESULTS DROPDOWN */}
                        {searchResult.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-black/95 border border-green-500/60 mt-2 rounded-2xl shadow-2xl overflow-hidden z-[120] animate-fade-in" ref={searchRef}>
                                <div className="text-xs bg-green-500/10 text-green-900 px-4 py-3 border-b border-green-900/30 uppercase tracking-widest font-bold">
                                    Nodes Found: {searchResult.length}
                                </div>
                                {searchResult.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => accessChat(user._id)}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-green-500/20 cursor-pointer border-b border-green-900/10 transition-colors group gap-3"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-base text-green-300 group-hover:text-white font-bold truncate max-w-[160px]">{user.name}</span>
                                            <span className="text-xs text-green-900 font-mono">ID: {user._id}</span>
                                        </div>
                                        <div className="w-11 h-11 border-2 border-green-900 rounded-full overflow-hidden group-hover:border-green-400 transition-all">
                                            <img
                                                src={user.profilePicture || "https://dicebear.com"}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0"
                                                alt="node"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {/* show loading  */}
                                {loading && <div className="p-3 text-center text-green-400 animate-pulse">Loading...</div>}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: User Info & Menu */}
                    <div className="flex items-center gap-2 sm:gap-5 md:gap-10 relative py-2 md:py-0">
                        {/* bell icon */}
                        <div className="relative">
                            {/* 1. The Icon & Badge */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="relative p-3 text-gray-600 hover:bg-green-900/10 rounded-full transition shadow"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004.707 14H5v1a3 3 0 006 0v-1h.293a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                                </svg>
                                {notification.length > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {notification.length}
                                    </span>
                                )}
                            </button>

                            {/* 2. The Dropdown List */}
                            <AnimatePresence>
                                {isOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)}></div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-80 bg-black/95 border border-green-500/60 rounded-2xl shadow-2xl p-3 z-[110]"
                                        >
                                            <div className="text-sm text-green-500/50 px-4 py-3 border-b border-green-900/30 font-mono uppercase tracking-widest font-bold">
                                                Incoming Transmission
                                            </div>

                                            {notification.length === 0 ? (
                                                <div className="p-4 text-center text-green-400 font-mono text-base">No active logs</div>
                                            ) : (
                                                // Grouping logic: Only show one row per unique chat ID
                                                notification
                                                    .filter((notif, index, self) =>
                                                        index === self.findIndex((t) => t.chat._id === notif.chat._id)
                                                    )
                                                    .map((notif) => {
                                                        // Count how many total messages exist for this specific chat
                                                        const chatMsgCount = notification.filter(n => n.chat._id === notif.chat._id).length;
                                                        const chatName = notif.chat.isGroupChat
                                                            ? notif.chat.chatName
                                                            : notif.sender.name;

                                                        return (
                                                            <div
                                                                key={notif._id}
                                                                className="px-4 py-4 text-base text-green-300 hover:bg-green-400/20 hover:text-green-100 flex items-center justify-between gap-3 font-mono group rounded-xl transition-all cursor-pointer border-b border-green-900/10 last:border-0"
                                                                onClick={() => {
                                                                    setCurrentChat(notif.chat);
                                                                    // Remove all notifications associated with this chat ID
                                                                    setNotification(notification.filter((n) => n.chat._id !== notif.chat._id));
                                                                    setIsOpen(false);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <span className="text-green-500 opacity-50 group-hover:opacity-100 transition-opacity">&gt;</span>
                                                                    <span className="truncate">{chatName}</span>
                                                                </div>

                                                                {chatMsgCount > 1 && (
                                                                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded border border-green-500/30">
                                                                        +{chatMsgCount - 1}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div
                            className="flex items-center gap-2 md:gap-4 border-l border-green-900/50 pl-4 md:pl-8 cursor-pointer group select-none"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <div className="hidden md:block text-right">
                                <p className="text-base font-bold text-green-200 leading-none truncate max-w-[160px]">
                                    {user?.name || "GUEST_USER"}
                                </p>
                                <span className="text-xs text-green-900 uppercase tracking-widest">ACCESS LVL 01</span>
                            </div>

                            <div className="relative w-12 h-12 md:w-16 md:h-16 border-2 border-green-400 p-0.5 bg-black rounded-full overflow-hidden shadow-lg group-hover:border-green-300 transition-all">
                                <img
                                    src={user?.profilePicture || `https://dicebear.com/api/human/?name=${user?.name || 'hacker'}`}
                                    alt="profile"
                                    className="grayscale group-hover:grayscale-0 transition-all w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)}></div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-4 w-64 bg-black/95 border border-green-500/60 rounded-2xl shadow-2xl p-3 z-[110] animate-fade-in"
                                    >
                                        <div className="text-sm text-green-900 px-4 py-3 border-b border-green-900/30 font-mono uppercase tracking-widest font-bold">System Links</div>

                                        <button
                                            onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }}
                                            className="w-full text-left px-4 py-3 text-base text-green-400 hover:bg-green-400/10 hover:text-green-900 flex items-center gap-3 font-mono group rounded-xl transition-all"
                                        >
                                            <span className="opacity-0 group-hover:opacity-100">&gt;</span> My Profile
                                        </button>

                                        <button
                                            onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}
                                            className="w-full text-left px-4 py-3 text-base text-green-400 hover:bg-green-400/10 hover:text-green-900 flex items-center gap-3 font-mono group rounded-xl transition-all"
                                        >
                                            <span className="opacity-0 group-hover:opacity-100">&gt;</span> Settings
                                        </button>

                                        <div className="h-[1px] bg-green-900/30 my-3"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 text-base text-red-400 hover:bg-red-600/80 hover:text-white flex items-center gap-3 font-mono group rounded-xl transition-all"
                                        >
                                            <span className="opacity-0 group-hover:opacity-100">&gt;</span> Terminate Session
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                {/* MOBILE SEARCH: Only shows on 'xs' and 'sm' screens below the header */}
                <div className="sm:hidden px-2 pb-2 animate-fade-in">
                    <div ref={searchRef} className="relative group">
                        <div className="relative flex w-full bg-black/80 border border-green-500/40 items-center focus-within:border-green-400 rounded-xl shadow-inner overflow-hidden transition-all">
                            <span className="pl-4">
                                <Search className="w-5 h-5 text-green-900" />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full bg-transparent px-4 py-3 text-base text-green-200 focus:outline-none font-mono placeholder:text-green-900/60"
                                placeholder="Search node..."
                            />
                            {loading && <div className="pr-4 text-base text-green-400 animate-pulse">...</div>}
                        </div>

                        {/* SEARCH RESULTS DROPDOWN */}
                        {searchResult.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-black/95 border border-green-500/60 mt-2 rounded-2xl shadow-2xl overflow-hidden z-[120] animate-fade-in" ref={searchRef}>
                                <div className="text-xs bg-green-500/10 text-green-900 px-4 py-3 border-b border-green-900/30 uppercase tracking-widest font-bold">
                                    Nodes Found: {searchResult.length}
                                </div>
                                {searchResult.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => accessChat(user._id)}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-green-500/20 cursor-pointer border-b border-green-900/10 transition-colors group gap-3"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-base text-green-300 group-hover:text-white font-bold truncate max-w-[160px]">{user.name}</span>
                                            <span className="text-xs text-green-900 font-mono">ID: {user._id}</span>
                                        </div>
                                        <div className="w-11 h-11 border-2 border-green-900 rounded-full overflow-hidden group-hover:border-green-400 transition-all">
                                            <img
                                                src={user.profilePicture || "https://dicebear.com"}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0"
                                                alt="node"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {/* show loading  */}
                                {loading && <div className="p-3 text-center text-green-400 animate-pulse">Loading...</div>}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Rendering Modals */}
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
};

export default TopBar;
