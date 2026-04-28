import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 
import { Mail, Lock } from 'lucide-react';
import AuthInput from '../../ui/AuthInput';
import { useChatState } from '../../context/ChatProvider'; // CRITICAL IMPORT

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { setUser } = useChatState(); // Fixes the "Same User" and "Stutter" bugs
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        if (e) e.preventDefault();
        if (!email || !password) return toast.error("ACCESS_DENIED: Fields empty");

        setLoading(true);
        try {
            const config = { headers: { "Content-type": "application/json" } };
            const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password }, config);

            // 1. Save to disk
            localStorage.setItem("userInfo", JSON.stringify(data));
            
            // 2. Update React Context immediately so TopBar is ready
            setUser(data); 

            toast.success("Identity Verified.");
            
            // 3. Small delay to let the toast be seen before the animation starts
            setTimeout(() => {
                setLoading(false);
                navigate("/chats");
            }, 500);
            
        } catch (error) {
            toast.error(error.response?.data?.message || "AUTHENTICATION_FAILED");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <Toaster position="bottom-center" />
            <form className="space-y-4" onSubmit={submitHandler}>
                <AuthInput value={email} onChange={(e) => setEmail(e.target.value)} icon={Mail} type="email" placeholder="USER_EMAIL" />
                <AuthInput value={password} onChange={(e) => setPassword(e.target.value)} icon={Lock} type="password" placeholder="USER_PASSWORD" />
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-4 rounded transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? "> INITIALIZING..." : "> LOGIN"}
                </button>
            </form>
        </div>
    );
};

export default Login;
