import { UserService } from '../services/user.service.js';
import { asyncHandler } from '../../../common/utils/async-handler.js';
import { uploadAvatar as uploadAvatarMiddleware } from '../../../common/utils/upload.js';
import { deleteFile, getPublicId } from '../../../common/utils/cloudinary-helpers.js';
const userService = new UserService();

export class UserController {
  static getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const profile = await userService.getUserProfile(userId);
    res.json({ success: true, data: profile });
  });

  static updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { fullName, bio, skillLevel, preferences } = req.body;

    const updatedUser = await userService.updateUserProfile(userId, {
      fullName,
      bio,
      skillLevel,
      preferences,
      updatedAt: new Date(),
    });

    res.json({ success: true, data: updatedUser });
  });

  static getStatistics = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const stats = await userService.getUserStatistics(userId);
    res.json({ success: true, data: stats });
  });

  static deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    await userService.deleteUser(userId);
    res.json({ success: true, message: 'Account deleted successfully' });
  });

  static searchUsers = asyncHandler(async (req, res) => {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    const users = await userService.searchUsers(query, Number(limit));
    res.json({ success: true, data: users });
  });

  // Thay hàm uploadAvatar cũ bằng:
  static uploadAvatar = [
    uploadAvatarMiddleware.single('avatar'),
    asyncHandler(async (req, res) => {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided' });
      }

      const avatarUrl = req.file.path; // Cloudinary trả về URL trong req.file.path

      // Xóa avatar cũ nếu có
      const currentUser = await userService.getUserProfile(userId);
      if (currentUser?.avatar) {
        const publicId = getPublicId(currentUser.avatar);
        if (publicId) await deleteFile(publicId, 'image');
      }

      const user = await userService.updateUserProfile(userId, { avatar: avatarUrl });

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: { avatarUrl, user },
      });
    }),
  ];
}
