import React from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { motion } from 'framer-motion';

const SocialButtons = () => {
  return (
    <div className="mt-2">
      {/* Designer Divider */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800/60"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
          <span className="bg-[#0f172a] px-4 text-slate-500 font-bold">
            Secure Auth Gateway
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'Google', icon: <FcGoogle size={20} />, id: 'google' },
          { name: 'GitHub', icon: <FaGithub size={20} className="text-white" />, id: 'github' }
        ].map((platform) => (
          <motion.button
            key={platform.id}
            whileHover={{ y: -2, backgroundColor: 'rgba(30, 41, 59, 0.8)' }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="flex items-center justify-center gap-3 py-3 px-4 border border-slate-700/50 rounded-xl text-slate-200 bg-slate-800/30 backdrop-blur-sm transition-colors duration-300 font-medium text-sm shadow-sm"
          >
            {platform.icon}
            <span>{platform.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SocialButtons;
