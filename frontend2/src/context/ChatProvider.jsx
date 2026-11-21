import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const ChatContext = createContext(null);

/**
 * Safely parse JSON from localStorage without throwing crashes
 */
const safeParse = (key, fallback = null) => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === "undefined") return fallback;
        return JSON.parse(item);
    } catch (e) {
        console.warn(`[STORAGE_WARN] Failed to parse '${key}':`, e);
        return fallback;
    }
};

export const ChatProvider = ({ children }) => {
    const [user, setUser] = useState(() => safeParse("userInfo", null));
    const [currentChat, setCurrentChatState] = useState(null);
    const [chats, setChats] = useState([]);
    const [notification, setNotification] = useState(() => safeParse("notifications", []));

    const navigate = useNavigate();
    const location = useLocation();

    // Persist notifications safely
    useEffect(() => {
        try {
            localStorage.setItem("notifications", JSON.stringify(notification));
        } catch (e) {
            console.warn("[STORAGE_WARN] Failed to persist notifications:", e);
        }
    }, [notification]);

    // Enhanced chat selector that automatically clears notifications for opened chat
    const setCurrentChat = useCallback((chat) => {
        setCurrentChatState(chat);
        if (chat?._id) {
            setNotification((prev) => prev.filter((n) => n.chat?._id !== chat._id));
        }
    }, []);

    // Auth Guard
    useEffect(() => {
        if (!user && location.pathname !== '/') {
            navigate('/');
        }
    }, [user, navigate, location.pathname]);

    // Synchronize authentication across browser tabs
    useEffect(() => {
        const syncAuth = (event) => {
            if (event.key === "userInfo") {
                const updatedUser = safeParse("userInfo", null);
                setUser(updatedUser);
            }
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
    }), [user, currentChat, setCurrentChat, chats, notification]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatState = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatState must be used within a ChatProvider");
    }
    return context;
};

export default ChatProvider;
