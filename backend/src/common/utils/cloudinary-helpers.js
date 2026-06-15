import cloudinary from '../../config/cloudinary.js';

// Xóa file trên Cloudinary
export const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === 'ok';
  } catch (error) {
    console.error('Failed to delete Cloudinary file:', error);
    return false;
  }
};

// Lấy public_id từ URL Cloudinary
export const getPublicId = (url) => {
  try {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const parentFolder = parts[parts.length - 3];
    return `${parentFolder}/${folder}/${fileName.split('.')[0]}`;
  } catch {
    return null;
  }
};

// Tạo thumbnail từ video
export const getVideoThumbnail = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    transformation: [
      { width: 640, height: 360, crop: 'fill' },
      { start_offset: '1' }, // lấy frame ở giây thứ 1
    ],
  });
};

// Lấy URL streaming HLS (cho video dài)
export const getStreamingUrl = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'm3u8', // HLS format
    streaming_profile: 'hd',
  });
};
