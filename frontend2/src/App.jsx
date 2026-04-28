import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Homepage from "./pages/Homepage";
import Chatpage from "./pages/Chatpage";

// Create a reusable animation wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, filter: "blur(10px)" }}
    animate={{ opacity: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, filter: "blur(10px)" }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <div className="App bg-black min-h-screen font-mono">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Homepage /></PageTransition>} />
          <Route path="/chats" element={<PageTransition><Chatpage /></PageTransition>} />
          <Route path="*" element={<div className="text-green-500 p-10 font-mono">404: NODE_NOT_FOUND</div>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
