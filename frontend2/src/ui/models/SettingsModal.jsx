import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Modal Window */}
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.1)] font-mono"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center bg-zinc-900 px-4 py-2 border-b border-green-500/50">
                            <span className="text-[10px] font-bold text-green-500">SYS_CONFIG_v4.0</span>
                            <button onClick={onClose} className="text-green-500 hover:text-red-500">[ ESC ]</button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Toggle Option */}
                            <div className="flex justify-between items-center group">
                                <div>
                                    <p className="text-xs text-green-400 group-hover:text-white transition-colors">END_TO_END_ENCRYPTION</p>
                                    <p className="text-[8px] text-green-900">FORCE_SSL_PROTOCOL</p>
                                </div>
                                <div className="w-12 h-5 border border-green-500 flex items-center px-1 bg-green-500/10">
                                    <div className="w-3 h-3 bg-green-500 ml-auto"></div>
                                </div>
                            </div>

                            {/* Range/Select Option */}
                            <div className="flex justify-between items-center group">
                                <div>
                                    <p className="text-xs text-green-400 group-hover:text-white transition-colors">AUDIO_FEEDBACK</p>
                                    <p className="text-[8px] text-green-900">KEY_STROKE_SOUNDS</p>
                                </div>
                                <div className="w-12 h-5 border border-zinc-700 flex items-center px-1 bg-zinc-900">
                                    <div className="w-3 h-3 bg-zinc-700"></div>
                                </div>
                            </div>

                            {/* Selectable List */}
                            <div className="space-y-2">
                                <p className="text-[9px] text-green-900 uppercase">Protocol_Level</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {['STABLE', 'BETA', 'DEV'].map((lvl) => (
                                        <button key={lvl} className={`text-[9px] py-1 border ${lvl === 'STABLE' ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-zinc-800 text-zinc-600'}`}>
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-green-900/30">
                                <button className="w-full py-2 bg-green-500 text-black text-xs font-black hover:bg-white hover:text-black transition-all uppercase">
                                    Update_Core_Settings
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
