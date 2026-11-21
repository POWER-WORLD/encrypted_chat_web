/**
 * Global Application Constants & Configuration
 * Standardized across frontend modules.
 */

// Production & Development Backend URLs
const DEFAULT_PROD_API_URL = 'https://encrypted-chat-web.onrender.com';
const DEFAULT_DEV_API_URL = 'http://localhost:5000';

const rawApiUrl = 
  import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL);

// Sanitize URL by removing trailing slash if present
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

// Cloudinary Configuration for Image Uploads
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkq2c6upe',
  UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'chatData_uploads',
  UPLOAD_URL: `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkq2c6upe'}/image/upload`
};

// Developer / Author Profile & Social Links
export const AUTHOR_PROFILE = {
  NAME: 'Pawan Kumar',
  ROLE: 'Full Stack Engineer & Security Specialist',
  PORTFOLIO: 'https://pawankumar.info/',
  LINKEDIN: 'https://www.linkedin.com/in/pawankumar101/',
  LEETCODE: 'https://leetcode.com/u/pk3253702/',
  GITHUB: 'https://github.com/POWER-WORLD'
};

/**
 * Generates a resilient, valid avatar URL for users or chats
 * @param {Object} target - User object or chat object
 * @param {string} fallbackSeed - Fallback seed string for avatar generation
 * @returns {string} Sanitized Image URL
 */
export const getAvatarUrl = (target, fallbackSeed = 'user') => {
  if (target?.profilePicture && typeof target.profilePicture === 'string' && target.profilePicture.startsWith('http')) {
    return target.profilePicture;
  }
  if (target?.groupImage && typeof target.groupImage === 'string' && target.groupImage.startsWith('http')) {
    return target.groupImage;
  }
  const seed = encodeURIComponent(target?.name || target?._id || fallbackSeed || 'node');
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=050505`;
};
