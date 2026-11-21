import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Shield, Globe, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAvatarUrl, AUTHOR_PROFILE } from '../../config/constants';

const ProfileModal = ({ isOpen, onClose, user }) => {
    const [copied, setCopied] = React.useState(false);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    const handleCopyId = () => {
        if (!user?._id) return;
        navigator.clipboard.writeText(user._id);
        setCopied(true);
        toast.success("NETWORK_ID copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const isAuthor = user?.email === 'pawankumar@info' || user?.name?.toLowerCase().includes('pawan');

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="profile-title"
                >
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onClose} 
                        className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
                        aria-hidden="true"
                    />
                    
                    {/* Modal Window */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-sm bg-zinc-950 border border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)] font-mono overflow-hidden rounded-xl z-10"
                    >
                        {/* CRT Scanline Overlay Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_3px] opacity-40 z-10"></div>

                        {/* Header */}
                        <div className="flex justify-between items-center bg-green-500/10 px-4 py-3 border-b border-green-500/30">
                            <span id="profile-title" className="text-xs font-bold text-green-400 tracking-[0.25em] flex items-center gap-2">
                                <Shield size={14} className="text-green-400 animate-pulse" />
                                NODE_IDENTITY_CARD
                            </span>
                            <button 
                                onClick={onClose} 
                                aria-label="Close Profile Modal"
                                className="text-zinc-400 hover:text-red-400 font-bold text-sm transition-colors z-20 px-1"
                            >
                                [ESC]
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col items-center relative z-20">
                            <div className="relative group mb-5">
                                <div className="absolute -inset-1.5 bg-green-500/30 blur-sm rounded-full opacity-75 animate-pulse"></div>
                                <div className="relative w-24 h-24 border-2 border-green-500 p-1 bg-black rounded-full overflow-hidden shadow-xl">
                                    <img 
                                        src={getAvatarUrl(user, user?.name)} 
                                        alt={user?.name || "User Avatar"} 
                                        className="w-full h-full object-cover grayscale brightness-110 transition-all group-hover:grayscale-0 rounded-full" 
                                    />
                                </div>
                            </div>

                            <div className="w-full space-y-3">
                                <div className="border-l-2 border-green-500 pl-3 py-1.5 bg-green-500/5 rounded-r">
                                    <p className="text-[9px] text-green-700 uppercase font-black tracking-widest">Handle</p>
                                    <p className="text-sm text-green-300 font-bold tracking-wider">{user?.name || "ANONYMOUS_NODE"}</p>
                                </div>
                                
                                <div className="border-l-2 border-green-500 pl-3 py-1.5 bg-green-500/5 rounded-r">
                                    <p className="text-[9px] text-green-700 uppercase font-black tracking-widest">Encrypted_Mail</p>
                                    <p className="text-xs text-green-300 break-all">{user?.email || "unknown@node.internal"}</p>
                                </div>

                                <div className="border-l-2 border-green-500 pl-3 py-1.5 bg-green-500/5 rounded-r flex justify-between items-center group">
                                    <div className="min-w-0 pr-2">
                                        <p className="text-[9px] text-green-700 uppercase font-black tracking-widest">Network_ID</p>
                                        <p className="text-[10px] text-zinc-400 font-mono break-all truncate">
                                            {user?._id || "0x000000000000000000000000"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCopyId}
                                        title="Copy ID"
                                        aria-label="Copy Network ID"
                                        className="p-1.5 border border-green-900/60 hover:border-green-400 text-green-400 rounded transition-all shrink-0 bg-black/60"
                                    >
                                        {copied ? <Check size={12} className="text-green-300" /> : <Copy size={12} />}
                                    </button>
                                </div>
                            </div>

                            {/* Author / Creator Badge if applicable */}
                            {isAuthor && (
                                <div className="mt-4 w-full p-2.5 border border-cyan-500/40 bg-cyan-950/20 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe size={14} className="text-cyan-400 shrink-0" />
                                        <span className="text-[10px] text-cyan-300 font-bold">SYSTEM ARCHITECT</span>
                                    </div>
                                    <a
                                        href={AUTHOR_PROFILE.PORTFOLIO}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-cyan-400 hover:text-white flex items-center gap-1 font-bold underline"
                                    >
                                        pawankumar.info <ExternalLink size={10} />
                                    </a>
                                </div>
                            )}

                            <button 
                                onClick={onClose}
                                className="mt-6 w-full py-2.5 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-bold text-xs uppercase tracking-widest transition-all rounded shadow-[0_0_15px_rgba(34,197,94,0.15)] active:scale-95 cursor-pointer"
                            >
                                CLOSE_CONNECTION
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;
