import React, { useState } from 'react';
import { Mail, Lock, User, Image, ShieldCheck } from 'lucide-react';
import AuthInput from '../../ui/AuthInput';
import { toast } from 'react-hot-toast'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useChatState } from '../../context/ChatProvider'; // 1. Import Context Hook

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePicture, setProfilePictureUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { setUser } = useChatState(); // 2. Destructure setUser
    const navigate = useNavigate();

    const postDetails = async (pics) => {
        if (!pics) return toast.error("Please select an image!");
        
        setLoading(true);
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

            try {
                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: "POST",
                    body: data,
                });
                const resData = await res.json();
                
                if (resData.secure_url) {
                    setProfilePictureUrl(resData.secure_url.toString());
                    toast.success("Image Uplink Established.");
                }
            } catch (err) {
                toast.error("Image Upload Failed!");
            } finally {
                setLoading(false);
            }
        } else {
            toast.error("Invalid File Type: Use JPG/PNG");
            setLoading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (!name || !email || !password || !confirmPassword) {
            return toast.error("ACCESS_DENIED: Fill all fields");
        }
        if (password !== confirmPassword) {
            return toast.error("ERROR: Passwords mismatch");
        }

        setLoading(true);
        try {
            const config = { headers: { "Content-type": "application/json" } };
            const { data } = await axios.post(`${API_BASE_URL}/api/users/register`, 
                { name, email, password, profilePicture }, 
                config
            );
            
            // 3. Store and Update Global State immediately
            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data); 
            
            toast.success("Identity Created.");
            
            // 4. Brief delay for a smoother visual transition
            setTimeout(() => {
                setLoading(false);
                navigate("/chats");
            }, 600);
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration Failed!");
            setLoading(false);
        }
    };

    return (
        <form className="space-y-4 font-mono" onSubmit={submitHandler}>
            <AuthInput icon={User} type="text" placeholder="FULL_NAME" value={name} onChange={(e) => setName(e.target.value)} />
            <AuthInput icon={Mail} type="email" placeholder="EMAIL_ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)} />
            <AuthInput icon={Lock} type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} />
            <AuthInput icon={ShieldCheck} type="password" placeholder="CONFIRM_PASSWORD" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            
            {/* Custom Styled File Input label to match hacker theme */}
            <div className="relative group cursor-pointer">
                <AuthInput 
                    onChange={(e) => postDetails(e.target.files[0])} 
                    icon={Image} 
                    type="file" 
                    accept="image/*"
                />
            </div>
            
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-4 rounded transition-all active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-600 mt-2 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
            >
                {loading ? "> INITIALIZING..." : "> CREATE_IDENTITY"}
            </button>
        </form>
    );
};

export default Signup;
