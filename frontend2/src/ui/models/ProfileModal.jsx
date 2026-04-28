import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileModal = ({ isOpen, onClose, user }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onClose} 
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />
                    
                    {/* Modal Window */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        className="relative w-full max-w-sm bg-black border border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)] font-mono overflow-hidden"
                    >
                        {/* CRT Scanline Overlay Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] z-10"></div>

                        {/* Header */}
                        <div className="flex justify-between items-center bg-green-500/10 px-4 py-2 border-b border-green-500/30">
                            <span className="text-[10px] font-bold text-green-500 tracking-[0.3em] animate-pulse">USER_ID_CARD</span>
                            <button onClick={onClose} className="text-green-500 hover:text-red-500 transition-colors z-20">[X]</button>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col items-center relative z-20">
                            <div className="relative group mb-6">
                                <div className="absolute -inset-2 bg-green-500/20 blur opacity-75 animate-pulse"></div>
                                <div className="relative w-24 h-24 border-2 border-green-500 p-1 bg-black overflow-hidden">
                                    <img 
                                        src={user?.profilePicture || `https://dicebear.com{user?.name || 'anonymous'}`} 
                                        alt="User" 
                                        className="w-full h-full grayscale brightness-125 transition-all group-hover:grayscale-0" 
                                    />
                                    {/* Moving Scan Bar */}
                                    <div className="absolute inset-0 w-full h-[2px] bg-green-500/50 shadow-[0_0_10px_#22c55e] animate-[scan_2s_linear_infinite]"></div>
                                </div>
                            </div>

                            <div className="w-full space-y-4">
                                <div className="border-l-2 border-green-500 pl-4 py-1 bg-green-500/5 transition-colors hover:bg-green-500/10">
                                    <p className="text-[8px] text-green-900 uppercase font-black">Handle</p>
                                    <p className="text-sm text-green-400 font-bold tracking-widest">{user?.name || "N/A"}</p>
                                </div>
                                
                                <div className="border-l-2 border-green-500 pl-4 py-1 bg-green-500/5 transition-colors hover:bg-green-500/10">
                                    <p className="text-[8px] text-green-900 uppercase font-black">Encrypted_Mail</p>
                                    <p className="text-sm text-green-400 break-all">{user?.email || "unknown@node.sys"}</p>
                                </div>

                                <div className="border-l-2 border-green-500 pl-4 py-1 bg-green-500/5 transition-colors hover:bg-green-500/10">
                                    <p className="text-[8px] text-green-900 uppercase font-black">Network_ID</p>
                                    <p className="text-[10px] text-green-700 font-mono break-all selection:bg-green-500 selection:text-black">
                                        {user?._id || "0x000000"}
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="mt-8 w-full py-2 border border-green-500 text-green-500 text-[10px] font-bold hover:bg-green-500 hover:text-black transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)] active:scale-95"
                            >
                                CLOSE_CONNECTION
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            <style>{`
                @keyframes scan {
                    0% { top: 0%; }
                    100% { top: 100%; }
                }
            `}</style>
        </AnimatePresence>
    );
};

export default ProfileModal;
