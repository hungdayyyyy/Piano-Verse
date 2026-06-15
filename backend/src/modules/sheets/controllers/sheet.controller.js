import { uploadPDF } from '../../../common/utils/upload.js';
import { deleteFile, getPublicId } from '../../../common/utils/cloudinary-helpers.js';
import { asyncHandler } from '../../../common/utils/async-handler.js';
import cloudinary from '../../../config/cloudinary.js';
import TrackModel from '../../streaming/models/track.model.js';

export class SheetController {
  // Upload PDF sheet music và gắn vào track
  static uploadSheet = [
    uploadPDF.single('sheet'),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No PDF file provided' });
      }

      const { trackId } = req.body;

      // Lấy thông tin chi tiết file từ Cloudinary (số trang, v.v.)
      const publicId = req.file.filename;
      let pages = 0;

      try {
        const details = await cloudinary.api.resource(publicId, {
          resource_type: 'raw',
          pages: true,
        });
        pages = details.pages || 0;
      } catch {
        // Không lấy được số trang thì bỏ qua
      }

      const sheetUrl = req.file.path;

      // Nếu có trackId thì gắn PDF vào track đó
      if (trackId) {
        const track = await TrackModel.findById(trackId);

        if (!track) {
          return res.status(404).json({ success: false, message: 'Track not found' });
        }

        // Xóa PDF cũ nếu có
        if (track.sheetMusicUrl) {
          const oldPublicId = getPublicId(track.sheetMusicUrl);
          if (oldPublicId) await deleteFile(oldPublicId, 'raw');
        }

        track.sheetMusicUrl = sheetUrl;
        track.sheetMusicPages = pages;
        await track.save();

        return res.status(201).json({
          success: true,
          message: 'Sheet music uploaded and linked to track',
          data: {
            sheetUrl,
            pages,
            track,
          },
        });
      }

      // Nếu không có trackId thì chỉ upload
      res.status(201).json({
        success: true,
        message: 'Sheet music uploaded successfully',
        data: { sheetUrl, pages },
      });
    }),
  ];

  // Lấy sheet music của một track
  static getSheet = asyncHandler(async (req, res) => {
    const { trackId } = req.params;
    const track = await TrackModel.findById(trackId).select(
      'title artist sheetMusicUrl sheetMusicPages'
    );

    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    if (!track.sheetMusicUrl) {
      return res.status(404).json({ success: false, message: 'No sheet music for this track' });
    }

    res.json({
      success: true,
      data: {
        title: track.title,
        artist: track.artist,
        sheetUrl: track.sheetMusicUrl,
        pages: track.sheetMusicPages,
      },
    });
  });

  // Xóa sheet music khỏi track
  static deleteSheet = asyncHandler(async (req, res) => {
    const { trackId } = req.params;
    const track = await TrackModel.findById(trackId);

    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    if (!track.sheetMusicUrl) {
      return res.status(404).json({ success: false, message: 'No sheet music to delete' });
    }

    const publicId = getPublicId(track.sheetMusicUrl);
    if (publicId) await deleteFile(publicId, 'raw');

    track.sheetMusicUrl = null;
    track.sheetMusicPages = 0;
    await track.save();

    res.json({ success: true, message: 'Sheet music deleted successfully' });
  });

  // Lấy danh sách tất cả tracks có sheet music
  static getAllSheets = asyncHandler(async (req, res) => {
    const { difficulty, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { sheetMusicUrl: { $ne: null } };
    if (difficulty) filter.difficulty = difficulty;

    const [sheets, total] = await Promise.all([
      TrackModel.find(filter)
        .select('title artist sheetMusicUrl sheetMusicPages difficulty thumbnailUrl')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      TrackModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: sheets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });
}
