import React, { useState } from 'react';
import { Mail, Lock, User, Image, ShieldCheck } from 'lucide-react';
import AuthInput from '../../ui/AuthInput';
import { toast } from 'react-hot-toast'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useChatState } from '../../context/ChatProvider';
import { API_BASE_URL, CLOUDINARY_CONFIG } from '../../config/constants';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePicture, setProfilePictureUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    
    const { setUser } = useChatState();
    const navigate = useNavigate();

    const postDetails = async (pics) => {
        if (!pics) return toast.error("SELECT_IMAGE: File required");
        
        if (pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/webp") {
            setUploadingImage(true);
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", CLOUDINARY_CONFIG.UPLOAD_PRESET);

            try {
                const res = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
                    method: "POST",
                    body: data,
                });
                const resData = await res.json();
                
                if (resData.secure_url) {
                    setProfilePictureUrl(resData.secure_url.toString());
                    toast.success("Image Uplink Established.");
                } else {
                    toast.error("Upload provider error: " + (resData.error?.message || "Failed"));
                }
            } catch {
                toast.error("Image Upload Failed! Check network/preset.");
            } finally {
                setUploadingImage(false);
            }
        } else {
            toast.error("Invalid File Type: Use JPG/PNG/WEBP");
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
            return toast.error("ACCESS_DENIED: All required fields must be filled");
        }
        if (password !== confirmPassword) {
            return toast.error("INTEGRITY_FAULT: Password verification mismatch");
        }
        if (password.length < 6) {
            return toast.error("KEY_POLICY_VIOLATION: Password must be at least 6 characters");
        }

        setLoading(true);
        try {
            const config = { headers: { "Content-type": "application/json" } };
            const { data } = await axios.post(
                `${API_BASE_URL}/api/users/register`, 
                { name: trimmedName, email: trimmedEmail, password, profilePicture }, 
                config
            );
            
            // Persist session
            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data); 
            
            toast.success("Node Identity Created.");
            
            setTimeout(() => {
                setLoading(false);
                navigate("/chats");
            }, 500);
            
        } catch (error) {
            const message = error.response?.data?.message || "Registration Failed: Network or Server Fault";
            toast.error(message);
            setLoading(false);
        }
    };

    return (
        <form className="space-y-4 font-mono" onSubmit={submitHandler} noValidate>
            <AuthInput 
                icon={User} 
                type="text" 
                name="name"
                placeholder="OPERATOR_HANDLE" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
            />
            <AuthInput 
                icon={Mail} 
                type="email" 
                name="email"
                placeholder="COMMUNICATION_MAIL" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <AuthInput 
                icon={Lock} 
                type="password" 
                name="password"
                placeholder="MASTER_PASSWORD" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <AuthInput 
                icon={ShieldCheck} 
                type="password" 
                name="confirmPassword"
                placeholder="CONFIRM_MASTER_PASSWORD" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
            />
            
            {/* Custom Styled File Input label to match hacker theme */}
            <div className="relative group">
                <AuthInput 
                    onChange={(e) => postDetails(e.target.files[0])} 
                    icon={Image} 
                    type="file" 
                    name="profilePicture"
                    placeholder="AVATAR_IMAGE"
                    accept="image/png, image/jpeg, image/webp"
                    required={false}
                />
                {uploadingImage && (
                    <p className="text-[10px] text-green-400 mt-1 animate-pulse">
                        UPLOADING AVATAR TELEMETRY...
                    </p>
                )}
            </div>
            
            <button 
                type="submit" 
                disabled={loading || uploadingImage}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-xl transition-all active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-600 mt-2 shadow-[0_0_20px_rgba(34,197,94,0.25)] font-mono tracking-widest text-sm cursor-pointer"
            >
                {loading ? "> INITIALIZING..." : "> CREATE_IDENTITY"}
            </button>
        </form>
    );
};

export default Signup;
