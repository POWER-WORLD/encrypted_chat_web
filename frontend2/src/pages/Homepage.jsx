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
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      navigate('/chats');
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row items-center justify-center p-2 md:p-6 w-full overflow-x-hidden"
      style={{ fontFamily: 'Michroma, sans-serif' }}
    >
      {/* Welcome Text Section */}
      <div className="flex md:w-1/2 flex-col items-center md:items-start justify-center p-6 text-center md:text-left">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-1.5 mb-6 text-[10px] font-medium tracking-[0.3em] uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
        >
          Secure Communication 2.0
        </motion.span>

        <h1
          className="text-white text-5xl sm:text-6xl lg:text-8xl font-black select-none leading-[0.9] tracking-tighter"
          style={{ fontFamily: 'Bitcount Grid Double, monospace' }}
        >
          <span className="inline-block">Welcome to</span>
          <br />
          <span className="relative inline-block mt-2 bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            Message Encryptor
          </span>
        </h1>

        <p className="mt-8 text-slate-400 text-lg max-w-md leading-relaxed font-light tracking-wide">
          Military-grade protection for your private conversations.
          <span className="text-slate-200"> Simple. Anonymous. Unbreakable.</span>
        </p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100px" }}
          transition={{ delay: 0.5, duration: 1 }}
          className="h-1 bg-gradient-to-r from-indigo-500 to-transparent mt-10 rounded-full"
        />
      </div>

      {/* Auth Container */}
      <div className="w-full max-w-[420px] bg-transparent relative mx-auto md:mx-10">
        {/* Tab Switcher */}
        <div className="flex p-1.5 gap-1 m-6 mb-4 rounded-2xl relative">
          <motion.div
            className="absolute bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/40"
            initial={false}
            animate={{ x: isLogin ? '0%' : '100%' }}
            style={{ width: 'calc(50% - 6px)', top: '6px', bottom: '6px', left: '6px' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-sm font-bold z-10 transition-colors duration-300 ${isLogin ? 'text-white' : 'text-slate-400'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-sm font-bold z-10 transition-colors duration-300 ${!isLogin ? 'text-white' : 'text-slate-400'}`}
          >
            Register
          </button>
        </div>

        <div className="px-6 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: isLogin ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 15 : -15 }}
              transition={{ duration: 0.2 }}
            >
              {isLogin ? <Login /> : <Signup />}
            </motion.div>
          </AnimatePresence>

          <div className="border-t border-slate-800/50 mt-6">
            <SocialButtons />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
