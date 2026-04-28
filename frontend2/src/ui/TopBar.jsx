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

    const { user, setUser, setCurrentChat, chats, setChats } = useChatState();
    const [search, setSearch] = useState('');
    const searchRef = React.useRef(null);
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

            <header className="relative bg-gradient-to-r from-black via-zinc-900 to-black select-none z-[100] shadow-lg">
                {/* Visual Scanning Effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-green-400/40 via-green-500/60 to-green-400/40 shadow-[0_0_16px_#22c55e] z-50 animate-pulse"></div>

                <div className="h-16 md:h-24 border-b border-green-500/20 flex items-center justify-between px-2 sm:px-4 md:px-10 transition-all duration-300">
                    {/* LEFT: Logo */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button onClick={onMenuToggle} className="md:hidden px-3 py-1 border border-green-500/50 text-green-500 font-mono text-xs rounded-lg hover:bg-green-500/10 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
                            <span className="tracking-widest">[ MENU ]</span>
                        </button>
                        <h1 className="text-base md:text-2xl font-black tracking-[0.2em] text-green-400 drop-shadow-lg uppercase select-text">MSG_CRYPT</h1>
                    </div>

                    {/* CENTER: Search Section */}
                    <div ref={searchRef} className="hidden sm:flex flex-1 max-w-lg mx-2 md:mx-8 relative group">
                        <div className="relative flex w-full bg-black/80 border border-green-500/30 items-center focus-within:border-green-400 rounded-lg shadow-inner overflow-hidden transition-all">
                            <span className="pl-3">
                                <Search className="w-4 h-4 text-green-900" />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full bg-transparent px-3 py-2 text-sm text-green-300 focus:outline-none font-mono placeholder:text-green-900/60"
                                placeholder="SEARCH_NODE..."
                            />
                            {loading && <div className="pr-3 text-xs text-green-400 animate-pulse">...</div>}
                        </div>

                        {/* SEARCH RESULTS DROPDOWN */}
                        {searchResult.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-black/95 border border-green-500/60 mt-2 rounded-xl shadow-2xl overflow-hidden z-[120] animate-fade-in" ref={searchRef}>
                                <div className="text-[10px] bg-green-500/10 text-green-900 px-3 py-2 border-b border-green-900/30 uppercase tracking-widest font-bold">
                                    Nodes_Found: {searchResult.length}
                                </div>
                                {searchResult.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => accessChat(user._id)}
                                        className="flex items-center justify-between px-3 py-2 hover:bg-green-500/20 cursor-pointer border-b border-green-900/10 transition-colors group gap-2"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs text-green-300 group-hover:text-white font-bold truncate max-w-[120px]">{user.name}</span>
                                            <span className="text-[9px] text-green-900 font-mono">ID: {user._id}</span>
                                        </div>
                                        <div className="w-9 h-9 border-2 border-green-900 rounded-full overflow-hidden group-hover:border-green-400 transition-all">
                                            <img
                                                src={user.profilePicture || "https://dicebear.com"}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0"
                                                alt="node"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {/* show loading  */}
                                {loading && <div className="p-2 text-center text-green-400 animate-pulse">Loading...</div>}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: User Info & Menu */}
                    <div className="flex items-center gap-2 sm:gap-4 md:gap-8 relative">
                        <button className="text-green-400 hover:text-red-500 transition-colors animate-pulse text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full p-1 md:p-2" title="System Alert">⚠</button>

                        <div
                            className="flex items-center gap-2 md:gap-3 border-l border-green-900/50 pl-3 md:pl-6 cursor-pointer group select-none"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <div className="hidden md:block text-right">
                                <p className="text-xs font-bold text-green-300 leading-none truncate max-w-[120px]">
                                    {user?.name || "GUEST_USER"}
                                </p>
                                <span className="text-[9px] text-green-900 uppercase tracking-widest">ACCESS_LVL_01</span>
                            </div>

                            <div className="relative w-9 h-9 md:w-14 md:h-14 border-2 border-green-400 p-0.5 bg-black rounded-full overflow-hidden shadow-md group-hover:border-green-300 transition-all">
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
                                        className="absolute right-0 top-full mt-3 w-56 bg-black/95 border border-green-500/60 rounded-xl shadow-2xl p-2 z-[110] animate-fade-in"
                                    >
                                        <div className="text-[11px] text-green-900 px-3 py-2 border-b border-green-900/30 font-mono uppercase tracking-widest font-bold">System_Links</div>

                                        <button
                                            onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }}
                                            className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-green-400/10 hover:text-green-900 flex items-center gap-2 font-mono group rounded-lg transition-all"
                                        >
                                            <span className="opacity-0 group-hover:opacity-100">&gt;</span> MY_PROFILE
                                        </button>

                                        <button
                                            onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}
                                            className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-green-400/10 hover:text-green-900 flex items-center gap-2 font-mono group rounded-lg transition-all"
                                        >
                                            <span className="opacity-0 group-hover:opacity-100">&gt;</span> SETTINGS
                                        </button>

                                        <div className="h-[1px] bg-green-900/30 my-2"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-600/80 hover:text-white flex items-center gap-2 font-mono group rounded-lg transition-all"
                                        >
                                            <span className="opacity-0 group-hover:opacity-100">&gt;</span> TERMINATE_SESSION
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
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
