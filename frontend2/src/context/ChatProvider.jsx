import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    // 1. Initialize state immediately to avoid 'undefined' on first render
    const [user, setUser] = useState(() => {
        const userInfo = localStorage.getItem("userInfo");
        return userInfo ? JSON.parse(userInfo) : null;
    });

    const [currentChat, setCurrentChat] = useState();
    const [chats, setChats] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 2. Redirect to login if user is missing, but only if we're not already on the login page
        if (!user && location.pathname !== '/') {
            navigate('/');
        }
    }, [user, navigate, location.pathname]);

    return (
        <ChatContext.Provider value={{ user, setUser, currentChat, setCurrentChat, chats, setChats }}>
            {children}
        </ChatContext.Provider>
    );
};

// 3. Custom hook for easier imports in other components
export const useChatState = () => useContext(ChatContext);

export default ChatProvider;
