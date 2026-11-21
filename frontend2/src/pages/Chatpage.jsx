import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../ui/TopBar';
import LeftSection from '../ui/LeftSection';
import RightSection from '../ui/RightSection';

const Chatpage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile drawer on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-black text-[#00ff41] font-mono">
      {/* Navigation & User Status TopBar */}
      <TopBar onMenuToggle={() => setMenuOpen((prev) => !prev)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Dark Overlay */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/85 z-40 md:hidden backdrop-blur-md"
                aria-hidden="true"
              />
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-y-0 left-0 z-50 w-80 max-w-[85vw] md:hidden shadow-2xl"
                role="dialog"
                aria-label="Mobile Navigation Drawer"
              >
                <LeftSection isMobile={true} onClose={() => setMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex shrink-0 h-full" aria-label="Desktop Chat Sidebar">
          <LeftSection isMobile={false} />
        </aside>

        {/* Chat Terminal Main Area */}
        <main className="flex-1 min-w-0 bg-[#050505] h-full" role="main" aria-label="Chat Terminal">
          <RightSection />
        </main>
      </div>
    </div>
  );
};

export default Chatpage;
