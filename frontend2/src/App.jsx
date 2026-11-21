import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Homepage from './pages/Homepage';
import Chatpage from './pages/Chatpage';
import ErrorBoundary from './components/common/ErrorBoundary';

// Reusable page transition wrapper with smooth Cyberpunk easing
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, filter: 'blur(8px)' }}
    animate={{ opacity: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, filter: 'blur(8px)' }}
    transition={{ duration: 0.35, ease: 'easeInOut' }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <div className="App bg-black min-h-screen font-mono text-[#00ff41] overflow-x-hidden selection:bg-green-500 selection:text-black">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Homepage />
                </PageTransition>
              }
            />
            <Route
              path="/chats"
              element={
                <PageTransition>
                  <Chatpage />
                </PageTransition>
              }
            />
            <Route
              path="*"
              element={
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                  <div className="border border-green-500/40 bg-zinc-950 p-8 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.15)] max-w-md w-full">
                    <h2 className="text-4xl font-black text-green-400 mb-2">404</h2>
                    <p className="text-sm text-green-700 tracking-widest uppercase mb-6">NODE_NOT_FOUND</p>
                    <p className="text-xs text-zinc-400 mb-6 font-sans">
                      The requested cryptographic route does not exist or access has expired.
                    </p>
                    <a
                      href="/"
                      className="inline-block px-6 py-2.5 bg-green-500 text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    >
                      Return to Gateway
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}

export default App;
