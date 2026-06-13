import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary.js';

// Storage cho avatar
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pianoverse/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }], // tự crop vuông
  },
});

// Storage cho audio
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pianoverse/audio',
    allowed_formats: ['mp3', 'wav', 'ogg'],
    resource_type: 'video', // Cloudinary dùng 'video' cho cả audio
  },
});

// Storage cho video
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pianoverse/videos',
    allowed_formats: ['mp4', 'webm', 'mov'],
    resource_type: 'video',
    transformation: [{ quality: 'auto' }], // tự tối ưu chất lượng
  },
});

// Storage cho PDF (sheet music)
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pianoverse/sheets',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
  },
});

// Giới hạn kích thước file
const limits = {
  avatar: { fileSize: 5 * 1024 * 1024 }, // 5MB
  audio: { fileSize: 50 * 1024 * 1024 }, // 50MB
  video: { fileSize: 500 * 1024 * 1024 }, // 500MB
  pdf: { fileSize: 20 * 1024 * 1024 }, // 20MB
};

export const uploadAvatar = multer({ storage: avatarStorage, limits: limits.avatar });
export const uploadAudio = multer({ storage: audioStorage, limits: limits.audio });
export const uploadVideo = multer({ storage: videoStorage, limits: limits.video });
export const uploadPDF = multer({ storage: pdfStorage, limits: limits.pdf });
