import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 
import { Mail, Lock } from 'lucide-react';
import AuthInput from '../../ui/AuthInput';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        if (e) e.preventDefault();
        
        if (!email || !password) {
            toast.error("Please fill all the fields");
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { "Content-type": "application/json" } };
            const { data } = await axios.post("/api/user/login", { email, password }, config);

            toast.success("Login Successful!");
            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            navigate("/chats");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error Occurred!");
            setLoading(false);
        }
    };

    return (
        <>
            <Toaster position="bottom-center" reverseOrder={false} />

            <form className="space-y-4" onSubmit={submitHandler}>
                <AuthInput 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    icon={Mail} type="email" placeholder="Email Address" 
                />
                <AuthInput 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    icon={Lock} type="password" placeholder="Password" 
                />
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 mt-2"
                >
                    {loading ? "Signing In..." : "Sign In"}
                </button>

                <button 
                    type="button" 
                    onClick={() => { setEmail("guest@example.com"); setPassword("123456"); }} 
                    className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 rounded-xl mt-2"
                >
                    Get Started as Guest
                </button>
            </form>
        </>
    );
};

export default Login;
