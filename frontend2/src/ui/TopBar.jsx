import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useChatState } from '../context/ChatProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, LogOut, User, Settings, Menu } from 'lucide-react';
import ProfileModal from './modals/ProfileModal';
import SettingsModal from './modals/SettingsModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getAvatarUrl } from '../config/constants';
import toast from 'react-hot-toast';

const TopBar = ({ onMenuToggle }) => {
    const { user, setUser, setCurrentChat, chats, setChats, notification, setNotification } = useChatState();
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // Click outside handler for search dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            const inDesktop = desktopSearchRef.current && desktopSearchRef.current.contains(event.target);
            const inMobile = mobileSearchRef.current && mobileSearchRef.current.contains(event.target);
            if (!inDesktop && !inMobile) {
                setSearchResult([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        setUser(null);
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const performSearch = useCallback(async (query) => {
        const trimmed = query.trim();
        if (!trimmed) {
            setSearchResult([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            const { data } = await axios.get(`${API_BASE_URL}/api/users?search=${encodeURIComponent(trimmed)}`, config);
            setLoading(false);
            setSearchResult(Array.isArray(data) ? data.slice(0, 10) : []);
        } catch {
            setLoading(false);
            toast.error("Network search fault");
        }
    }, [user?.token]);

    const handleSearchInput = (value) => {
        setSearch(value);
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
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
            const { data } = await axios.post(`${API_BASE_URL}/api/chats`, { userId }, config);
            if (!chats.some((c) => c._id === data._id)) {
                setChats([data, ...chats]);
            }
            setCurrentChat(data);
            setSearch('');
            setSearchResult([]);
            setLoading(false);
        } catch {
            toast.error("Failed to establish peer channel");
            setLoading(false);
        }
    };

    return (
        <>
            <header className="relative bg-zinc-950 border-b border-green-900/40 select-none z-30 shadow-2xl">
                {/* Visual Top Glow Bar */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-green-500/20 via-green-400 to-green-500/20 shadow-[0_0_15px_#22c55e]"></div>

                <div className="h-16 md:h-18 flex items-center justify-between px-3 sm:px-6 md:px-8">
                    {/* LEFT: Menu Trigger & Logo */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onMenuToggle} 
                            aria-label="Toggle Mobile Navigation"
                            className="md:hidden p-2 border border-green-500/40 text-green-400 font-mono text-xs rounded-lg hover:bg-green-500/10 focus:outline-none focus:ring-1 focus:ring-green-400 transition-all flex items-center gap-1.5"
                        >
                            <Menu size={16} />
                            <span className="hidden xs:inline">NODES</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75"></span>
                            <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-[0.2em] text-green-400 uppercase select-text font-mono drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                MSG_CRYPT
                            </h1>
                        </div>
                    </div>

                    {/* CENTER: Desktop Search Section */}
                    <div ref={desktopSearchRef} className="hidden sm:flex flex-1 max-w-md mx-6 relative">
                        <div className="relative flex w-full bg-black/90 border border-green-900/60 focus-within:border-green-500 rounded-xl shadow-inner transition-all items-center">
                            <span className="pl-3.5 text-zinc-500 pointer-events-none">
                                <Search size={16} />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                className="w-full bg-transparent px-3 py-2 text-xs text-green-200 focus:outline-none font-mono placeholder:text-zinc-600"
                                placeholder="Search node by handle or mail..."
                                aria-label="Search nodes"
                            />
                            {loading && <span className="pr-3 text-xs text-green-400 animate-pulse font-mono">...</span>}
                        </div>

                        {/* Search Results Dropdown */}
                        {searchResult.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-black/95 border border-green-500/50 mt-2 rounded-xl shadow-2xl overflow-hidden z-50">
                                <div className="text-[10px] bg-green-500/10 text-green-400 px-3 py-2 border-b border-green-900/30 uppercase tracking-widest font-bold">
                                    Nodes Discovered ({searchResult.length})
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {searchResult.map((node) => (
                                        <div
                                            key={node._id}
                                            onClick={() => accessChat(node._id)}
                                            className="flex items-center justify-between px-3 py-2.5 hover:bg-green-500/15 cursor-pointer border-b border-zinc-900/80 transition-colors group"
                                        >
                                            <div className="flex flex-col min-w-0 pr-2">
                                                <span className="text-xs text-green-300 group-hover:text-white font-bold truncate">{node.name}</span>
                                                <span className="text-[9px] text-zinc-500 font-mono truncate">{node.email}</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-green-900 overflow-hidden shrink-0">
                                                <img
                                                    src={getAvatarUrl(node, node.name)}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 rounded-full"
                                                    alt={node.name}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Notifications & User Profile */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                aria-label="Notifications"
                                className="relative p-2.5 text-zinc-400 hover:text-green-400 hover:bg-zinc-900 rounded-full transition cursor-pointer"
                            >
                                <Bell size={18} />
                                {notification.length > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                                        {notification.length}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {isNotifOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsNotifOpen(false)}></div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-72 sm:w-80 bg-zinc-950 border border-green-500/50 rounded-xl shadow-2xl p-2 z-50 font-mono"
                                        >
                                            <div className="text-[10px] text-green-500/70 px-3 py-2 border-b border-zinc-800 uppercase tracking-widest font-bold flex justify-between items-center">
                                                <span>Incoming Transmissions</span>
                                                {notification.length > 0 && (
                                                    <button 
                                                        onClick={() => setNotification([])} 
                                                        className="text-[9px] text-zinc-500 hover:text-red-400 uppercase font-normal"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </div>

                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                {notification.length === 0 ? (
                                                    <div className="p-4 text-center text-zinc-500 text-xs">No active telemetry logs</div>
                                                ) : (
                                                    notification
                                                        .filter((notif, index, self) =>
                                                            index === self.findIndex((t) => t.chat?._id === notif.chat?._id)
                                                        )
                                                        .map((notif, idx) => {
                                                            const chatMsgCount = notification.filter((n) => n.chat?._id === notif.chat?._id).length;
                                                            const chatName = notif.chat?.isGroupChat
                                                                ? notif.chat?.chatName
                                                                : notif.sender?.name;

                                                            return (
                                                                <div
                                                                    key={notif._id || `notif-item-${idx}`}
                                                                    className="px-3 py-2.5 text-xs text-green-300 hover:bg-green-500/15 flex items-center justify-between gap-2 rounded-lg transition-all cursor-pointer border-b border-zinc-900"
                                                                    onClick={() => {
                                                                        setCurrentChat(notif.chat);
                                                                        setNotification(notification.filter((n) => n.chat?._id !== notif.chat?._id));
                                                                        setIsNotifOpen(false);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-2 truncate">
                                                                        <span className="text-green-500 text-xs">&gt;</span>
                                                                        <span className="truncate font-bold">{chatName}</span>
                                                                    </div>
                                                                    {chatMsgCount > 1 && (
                                                                        <span className="bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0.5 rounded border border-green-500/30">
                                                                            +{chatMsgCount - 1}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* User Identity / Avatar Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                aria-label="User Account Menu"
                                className="flex items-center gap-2.5 pl-3 border-l border-zinc-800 cursor-pointer group select-none text-left"
                            >
                                <div className="hidden sm:block text-right">
                                    <p className="text-xs font-bold text-green-300 leading-tight truncate max-w-[120px]">
                                        {user?.name || "OPERATOR"}
                                    </p>
                                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">ACCESS LVL 01</span>
                                </div>

                                <div className="w-9 h-9 md:w-10 md:h-10 border border-green-500/60 p-0.5 bg-black rounded-full overflow-hidden shadow-lg group-hover:border-green-400 transition-all">
                                    <img
                                        src={getAvatarUrl(user, user?.name)}
                                        alt="profile"
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 rounded-full"
                                    />
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsUserMenuOpen(false)}></div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-green-500/50 rounded-xl shadow-2xl p-2 z-50 font-mono"
                                        >
                                            <div className="text-[10px] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 uppercase tracking-widest font-bold">
                                                System Controls
                                            </div>

                                            <button
                                                onClick={() => { setIsProfileOpen(true); setIsUserMenuOpen(false); }}
                                                className="w-full text-left px-3 py-2 text-xs text-green-300 hover:bg-green-500/15 flex items-center gap-2 rounded-lg transition-all"
                                            >
                                                <User size={14} className="text-green-400" />
                                                <span>Operator Profile</span>
                                            </button>

                                            <button
                                                onClick={() => { setIsSettingsOpen(true); setIsUserMenuOpen(false); }}
                                                className="w-full text-left px-3 py-2 text-xs text-green-300 hover:bg-green-500/15 flex items-center gap-2 rounded-lg transition-all"
                                            >
                                                <Settings size={14} className="text-green-400" />
                                                <span>Configurations</span>
                                            </button>

                                            <div className="h-[1px] bg-zinc-800 my-1.5"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 flex items-center gap-2 rounded-lg transition-all"
                                            >
                                                <LogOut size={14} />
                                                <span>Terminate Session</span>
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar: under header for small devices */}
                <div ref={mobileSearchRef} className="sm:hidden px-3 pb-3 relative">
                    <div className="relative flex w-full bg-black border border-green-900/60 focus-within:border-green-500 rounded-lg shadow-inner items-center">
                        <span className="pl-3 text-zinc-500 pointer-events-none">
                            <Search size={14} />
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            className="w-full bg-transparent px-3 py-2 text-xs text-green-200 focus:outline-none font-mono placeholder:text-zinc-600"
                            placeholder="Search nodes..."
                            aria-label="Mobile Search nodes"
                        />
                        {loading && <span className="pr-3 text-xs text-green-400 animate-pulse font-mono">...</span>}
                    </div>

                    {/* Mobile Search Results */}
                    {searchResult.length > 0 && (
                        <div className="absolute top-full left-3 right-3 bg-black/95 border border-green-500/50 mt-1 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                {searchResult.map((node) => (
                                    <div
                                        key={node._id}
                                        onClick={() => accessChat(node._id)}
                                        className="flex items-center justify-between px-3 py-2 hover:bg-green-500/15 cursor-pointer border-b border-zinc-900"
                                    >
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <span className="text-xs text-green-300 font-bold truncate">{node.name}</span>
                                            <span className="text-[9px] text-zinc-500 font-mono truncate">{node.email}</span>
                                        </div>
                                        <div className="w-7 h-7 rounded-full border border-green-900 overflow-hidden shrink-0">
                                            <img
                                                src={getAvatarUrl(node, node.name)}
                                                className="w-full h-full object-cover grayscale rounded-full"
                                                alt={node.name}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Modals */}
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
