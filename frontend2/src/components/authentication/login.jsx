import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 
import { Mail, Lock } from 'lucide-react';
import AuthInput from '../../ui/AuthInput';
import { useChatState } from '../../context/ChatProvider';
import { API_BASE_URL } from '../../config/constants';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { setUser } = useChatState();
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        if (e) e.preventDefault();
        
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            return toast.error("ACCESS_DENIED: All credentials required");
        }

        setLoading(true);
        try {
            const config = { headers: { "Content-type": "application/json" } };
            const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, { email: trimmedEmail, password }, config);

            // 1. Persist authenticated session
            localStorage.setItem("userInfo", JSON.stringify(data));
            
            // 2. Synchronize global context immediately
            setUser(data); 

            toast.success("Identity Verified. Uplink Established.");
            
            setTimeout(() => {
                setLoading(false);
                navigate("/chats");
            }, 400);
            
        } catch (error) {
            const errorMsg = error.response?.data?.message || "AUTHENTICATION_FAILED: Invalid credentials";
            toast.error(errorMsg);
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <Toaster position="bottom-center" toastOptions={{ style: { background: '#0a0a0a', color: '#22c55e', border: '1px solid #16a34a' } }} />
            <form className="space-y-4" onSubmit={submitHandler} noValidate>
                <AuthInput 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    icon={Mail} 
                    type="email" 
                    name="email"
                    placeholder="OPERATOR_EMAIL" 
                />
                <AuthInput 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    icon={Lock} 
                    type="password" 
                    name="password"
                    placeholder="ENCRYPTION_KEY" 
                />
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 font-mono tracking-widest text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer"
                >
                    {loading ? "> AUTHENTICATING..." : "> INITIATE_SESSION"}
                </button>
            </form>
        </div>
    );
};

export default Login;
