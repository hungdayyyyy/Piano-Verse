import { uploadAudio, uploadVideo } from '../../../common/utils/upload.js';
import {
  deleteFile,
  getPublicId,
  getVideoThumbnail,
  getStreamingUrl,
} from '../../../common/utils/cloudinary-helpers.js';
import { asyncHandler } from '../../../common/utils/async-handler.js';
import TrackModel from '../models/track.model.js';

export class TrackController {
  // Upload file audio
  static uploadAudio = [
    uploadAudio.single('audio'),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No audio file provided' });
      }

      const { title, artist, difficulty } = req.body;

      if (!title || !artist) {
        return res.status(400).json({ success: false, message: 'Title and artist required' });
      }

      const track = await TrackModel.create({
        title,
        artist,
        audioUrl: req.file.path,
        durationSeconds: 0, // cập nhật sau
        difficulty: difficulty || 'intermediate',
      });

      res.status(201).json({
        success: true,
        message: 'Audio uploaded successfully',
        data: track,
      });
    }),
  ];

  // Upload video bài học
  static uploadVideo = [
    uploadVideo.single('video'),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No video file provided' });
      }

      const { title, artist, difficulty } = req.body;
      const publicId = getPublicId(req.file.path);

      const track = await TrackModel.create({
        title,
        artist,
        audioUrl: req.file.path, // URL video gốc
        thumbnailUrl: getVideoThumbnail(publicId), // thumbnail tự động
        streamingUrl: getStreamingUrl(publicId), // HLS streaming URL
        durationSeconds: 0,
        difficulty: difficulty || 'intermediate',
        type: 'video',
      });

      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        data: {
          ...track.toObject(),
          streamingUrl: track.streamingUrl,
          thumbnailUrl: track.thumbnailUrl,
        },
      });
    }),
  ];

  // Xóa track
  static deleteTrack = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const track = await TrackModel.findById(id);

    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    // Xóa file trên Cloudinary
    const publicId = getPublicId(track.audioUrl);
    if (publicId) {
      const resourceType = track.type === 'video' ? 'video' : 'video'; // audio cũng là 'video' trên Cloudinary
      await deleteFile(publicId, resourceType);
    }

    await TrackModel.findByIdAndDelete(id);

    res.json({ success: true, message: 'Track deleted successfully' });
  });
}
