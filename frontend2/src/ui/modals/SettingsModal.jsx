import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ShieldCheck, Volume2, ExternalLink } from 'lucide-react';
import { FaGlobe, FaLinkedin, FaGithub } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';
import { AUTHOR_PROFILE } from '../../config/constants';
import toast from 'react-hot-toast';

const SettingsModal = ({ isOpen, onClose }) => {
    const [e2eEnabled, setE2eEnabled] = useState(true);
    const [audioFeedback, setAudioFeedback] = useState(false);
    const [protocolLevel, setProtocolLevel] = useState('STABLE');

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    const handleSave = () => {
        toast.success("SYSTEM_CONFIG synchronized");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="settings-title"
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
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.2)] font-mono rounded-xl overflow-hidden z-10"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center bg-zinc-900 px-5 py-3 border-b border-green-500/40">
                            <span id="settings-title" className="text-xs font-bold text-green-400 tracking-widest flex items-center gap-2">
                                <Settings size={14} className="text-green-400" />
                                SYS_CONFIG // v2.0
                            </span>
                            <button 
                                onClick={onClose} 
                                aria-label="Close Settings Modal"
                                className="text-zinc-400 hover:text-red-400 font-bold text-xs"
                            >
                                [ ESC ]
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Toggle: E2E Encryption */}
                            <div className="flex justify-between items-center group cursor-pointer" onClick={() => setE2eEnabled(!e2eEnabled)}>
                                <div>
                                    <p className="text-xs text-green-300 font-bold flex items-center gap-1.5">
                                        <ShieldCheck size={14} className="text-green-400" /> END_TO_END_ENCRYPTION
                                    </p>
                                    <p className="text-[9px] text-green-800">AES-256 + HMAC INTEGRITY PROTOCOL</p>
                                </div>
                                <div className={`w-12 h-6 border rounded-full flex items-center px-1 transition-colors ${e2eEnabled ? 'border-green-500 bg-green-500/20' : 'border-zinc-700 bg-zinc-900'}`}>
                                    <div className={`w-4 h-4 rounded-full transition-transform ${e2eEnabled ? 'bg-green-400 translate-x-5' : 'bg-zinc-600 translate-x-0'}`}></div>
                                </div>
                            </div>

                            {/* Toggle: Audio Feedback */}
                            <div className="flex justify-between items-center group cursor-pointer" onClick={() => setAudioFeedback(!audioFeedback)}>
                                <div>
                                    <p className="text-xs text-green-300 font-bold flex items-center gap-1.5">
                                        <Volume2 size={14} className="text-green-400" /> AUDIO_FEEDBACK
                                    </p>
                                    <p className="text-[9px] text-green-800">SYNTHETIC KEYSTROKE & PACKET TONES</p>
                                </div>
                                <div className={`w-12 h-6 border rounded-full flex items-center px-1 transition-colors ${audioFeedback ? 'border-green-500 bg-green-500/20' : 'border-zinc-700 bg-zinc-900'}`}>
                                    <div className={`w-4 h-4 rounded-full transition-transform ${audioFeedback ? 'bg-green-400 translate-x-5' : 'bg-zinc-600 translate-x-0'}`}></div>
                                </div>
                            </div>

                            {/* Selectable Protocol Level */}
                            <div className="space-y-2">
                                <p className="text-[9px] text-green-700 uppercase tracking-widest font-black">Cluster_Protocol_Level</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {['STABLE', 'BETA', 'SECURE'].map((lvl) => (
                                        <button 
                                            key={lvl} 
                                            type="button"
                                            onClick={() => setProtocolLevel(lvl)}
                                            className={`text-[10px] py-2 border rounded font-bold transition-all ${protocolLevel === lvl ? 'border-green-500 text-green-400 bg-green-500/15 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ARCHITECT & DEVELOPER PROFILES */}
                            <div className="pt-4 border-t border-zinc-800/80 space-y-2">
                                <p className="text-[9px] text-green-600 uppercase tracking-widest font-bold">
                                    Lead Architect Verified Profiles
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <a
                                        href={AUTHOR_PROFILE.PORTFOLIO}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 p-2 bg-zinc-900 border border-zinc-800 hover:border-cyan-500 rounded text-zinc-300 hover:text-cyan-400 transition-colors"
                                    >
                                        <FaGlobe size={12} className="text-cyan-400" />
                                        <span className="truncate">Portfolio</span>
                                        <ExternalLink size={10} className="ml-auto opacity-60" />
                                    </a>
                                    <a
                                        href={AUTHOR_PROFILE.LINKEDIN}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 p-2 bg-zinc-900 border border-zinc-800 hover:border-blue-500 rounded text-zinc-300 hover:text-blue-400 transition-colors"
                                    >
                                        <FaLinkedin size={12} className="text-blue-400" />
                                        <span className="truncate">LinkedIn</span>
                                        <ExternalLink size={10} className="ml-auto opacity-60" />
                                    </a>
                                    <a
                                        href={AUTHOR_PROFILE.GITHUB}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 p-2 bg-zinc-900 border border-zinc-800 hover:border-green-500 rounded text-zinc-300 hover:text-green-400 transition-colors"
                                    >
                                        <FaGithub size={12} className="text-green-400" />
                                        <span className="truncate">GitHub</span>
                                        <ExternalLink size={10} className="ml-auto opacity-60" />
                                    </a>
                                    <a
                                        href={AUTHOR_PROFILE.LEETCODE}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 p-2 bg-zinc-900 border border-zinc-800 hover:border-amber-500 rounded text-zinc-300 hover:text-amber-400 transition-colors"
                                    >
                                        <SiLeetcode size={12} className="text-amber-400" />
                                        <span className="truncate">LeetCode</span>
                                        <ExternalLink size={10} className="ml-auto opacity-60" />
                                    </a>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button 
                                    onClick={handleSave}
                                    className="w-full py-3 bg-green-500 hover:bg-green-400 text-black text-xs font-black rounded transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-95 cursor-pointer"
                                >
                                    APPLY_CORE_SETTINGS
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
