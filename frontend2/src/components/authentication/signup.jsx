import React, { useState } from 'react'; // Use destructuring for cleaner code
import { Mail, Lock, User, Image, ShieldCheck } from 'lucide-react';
import AuthInput from '../../ui/AuthInput';
import { toast } from 'react-hot-toast'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Environment variables
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
    const navigate = useNavigate();

    const postDetails = async (pics) => {
        setLoading(true);

        if (!pics) {
            toast.error("Please select an image!");
            setLoading(false);
            return;
        }

        // Validate File Type
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
                    toast.success("Image uploaded!");
                } else {
                    throw new Error("Upload failed");
                }
            } catch (err) {
                toast.error("Image upload failed!");
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            toast.error("Please select a valid JPEG/PNG");
            setLoading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (!name || !email || !password || !confirmPassword) {
            toast.error("Please fill all fields");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { "Content-type": "application/json" } };
            const { data } = await axios.post(`${API_BASE_URL}/api/users/register`, 
                { name, email, password, profilePicture }, 
                config
            );
            
            toast.success("Registration Successful!");
            localStorage.setItem("userInfo", JSON.stringify(data));
            navigate("/chats");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error Occurred!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={submitHandler} style={{ fontFamily: 'Michroma, sans-serif' }}>
            <AuthInput icon={User} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <AuthInput icon={Mail} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <AuthInput icon={Lock} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <AuthInput icon={ShieldCheck} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            
            <AuthInput 
                onChange={(e) => postDetails(e.target.files[0])} // Correctly targets the first file
                icon={Image} 
                type="file" 
                accept="image/*"
            />
            
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.97] disabled:bg-slate-700 mt-2 shadow-lg shadow-indigo-600/20"
            >
                {loading ? "Processing..." : "Sign Up"}
            </button>
        </form>
    );
};

export default Signup; // Properly closed now
