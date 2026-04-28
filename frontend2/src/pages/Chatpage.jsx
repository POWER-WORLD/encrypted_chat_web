import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../ui/TopBar';
import LeftSection from '../ui/LeftSection';
import RightSection from '../ui/RightSection';

const Chatpage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-black text-[#00ff41] font-mono">
      {/* Navigation & User Status */}
      <TopBar onMenuToggle={() => setMenuOpen(!menuOpen)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Dark Overlay */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
              />
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-y-0 left-0 z-50 w-72 md:hidden"
              >
                <LeftSection isMobile={true} onClose={() => setMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <LeftSection />
        </div>

        {/* Chat Terminal Area */}
        <main className="flex-1 min-w-0 bg-[#050505]">
          <RightSection />
        </main>
      </div>
    </div>
  );
}

export default Chatpage;
