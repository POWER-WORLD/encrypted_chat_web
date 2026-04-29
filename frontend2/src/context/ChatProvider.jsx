import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const userInfo = localStorage.getItem("userInfo");
        return userInfo ? JSON.parse(userInfo) : null;
    });

    const [currentChat, setCurrentChat] = useState(null);
    const [chats, setChats] = useState([]);
    
    // 1. Persistence: Load notifications from localStorage on startup
    const [notification, setNotification] = useState(() => {
        const savedNotifications = localStorage.getItem("notifications");
        return savedNotifications ? JSON.parse(savedNotifications) : [];
    });

    const navigate = useNavigate();
    const location = useLocation();

    // 2. Persistence: Save notifications to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("notifications", JSON.stringify(notification));
    }, [notification]);

    // 3. Auto-Clear: If user is looking at a chat, remove its notifications
    useEffect(() => {
        if (currentChat) {
            setNotification((prev) => prev.filter((n) => n.chat._id !== currentChat._id));
        }
    }, [currentChat]);

    // Auth Guard
    useEffect(() => {
        if (!user && location.pathname !== '/') {
            navigate('/');
        }
    }, [user, navigate, location.pathname]);

    // Sync State across Tabs
    useEffect(() => {
        const syncAuth = () => {
            const userInfo = localStorage.getItem("userInfo");
            setUser(userInfo ? JSON.parse(userInfo) : null);
        };
        window.addEventListener("storage", syncAuth);
        return () => window.removeEventListener("storage", syncAuth);
    }, []);

    const value = useMemo(() => ({
        user, 
        setUser, 
        currentChat, 
        setCurrentChat, 
        chats, 
        setChats, 
        notification, 
        setNotification 
    }), [user, currentChat, chats, notification]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatState = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChatState must be used within a ChatProvider");
    }
    return context;
};

export default ChatProvider;
