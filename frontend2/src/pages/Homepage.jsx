import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SocialButtons from '../ui/SocialButtons';
import Login from '../components/authentication/login';
import Signup from '../components/authentication/signup';

const Homepage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate('/chats');
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row items-center justify-center p-3 sm:p-6 w-full overflow-x-hidden bg-black text-[#00ff41]"
      style={{ fontFamily: 'Michroma, sans-serif' }}
    >
      {/* Welcome Hero Section */}
      <header className="flex md:w-1/2 flex-col items-center md:items-start justify-center p-4 sm:p-8 text-center md:text-left z-10">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-1.5 mb-6 text-[10px] font-bold tracking-[0.3em] uppercase text-green-400 bg-green-500/10 border border-green-500/30 rounded-full"
        >
          Secure Communication 2.0 // Active
        </motion.span>

        <h1
          className="text-white text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black select-none leading-[0.95] tracking-tighter"
          style={{ fontFamily: 'Bitcount Grid Double, monospace' }}
        >
          <span className="inline-block">Welcome to</span>
          <br />
          <span className="relative inline-block mt-2 bg-gradient-to-r from-green-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent filter drop-shadow-[0_0_25px_rgba(34,197,94,0.4)]">
            MSG_CRYPT
          </span>
        </h1>

        <p className="mt-8 text-zinc-300 text-sm sm:text-base lg:text-lg max-w-md leading-relaxed font-mono">
          Military-grade cryptographic integrity for real-time private channels.
          <span className="text-green-400 font-bold block sm:inline"> Simple. Anonymous. Decentralized.</span>
        </p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '120px' }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="h-1 bg-gradient-to-r from-green-500 to-transparent mt-8 rounded-full"
        />
      </header>

      {/* Auth Container Section */}
      <main className="w-full max-w-[440px] bg-zinc-950/90 border border-green-500/30 rounded-2xl relative mx-auto md:mx-6 p-2 sm:p-4 shadow-[0_0_50px_rgba(34,197,94,0.15)] z-10">
        {/* Tab Switcher */}
        <div className="flex p-1.5 gap-1 m-2 mb-4 bg-black/80 border border-green-900/60 rounded-xl relative">
          <motion.div
            className="absolute bg-green-500 rounded-lg shadow-lg shadow-green-500/30"
            initial={false}
            animate={{ x: isLogin ? '0%' : '100%' }}
            style={{ width: 'calc(50% - 6px)', top: '6px', bottom: '6px', left: '6px' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
          <button
            onClick={() => setIsLogin(true)}
            aria-label="Switch to Login form"
            className={`flex-1 py-3 text-xs uppercase font-mono font-bold z-10 transition-colors duration-300 cursor-pointer ${
              isLogin ? 'text-black' : 'text-zinc-400 hover:text-green-400'
            }`}
          >
            Authenticate
          </button>
          <button
            onClick={() => setIsLogin(false)}
            aria-label="Switch to Register form"
            className={`flex-1 py-3 text-xs uppercase font-mono font-bold z-10 transition-colors duration-300 cursor-pointer ${
              !isLogin ? 'text-black' : 'text-zinc-400 hover:text-green-400'
            }`}
          >
            Register Node
          </button>
        </div>

        <div className="px-4 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 15 : -15 }}
              transition={{ duration: 0.2 }}
            >
              {isLogin ? <Login /> : <Signup />}
            </motion.div>
          </AnimatePresence>

          <div className="border-t border-zinc-800/80 mt-4">
            <SocialButtons />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Homepage;
