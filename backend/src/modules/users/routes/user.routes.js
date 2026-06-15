import express from 'express'
import { authenticate } from '../../../common/middleware/auth.middleware.js'
import { validate } from '../../../common/middleware/validation.middleware.js'
import { UserController } from '../controllers/user.controller.js'
import { updateProfileSchema, searchUsersSchema } from '../validators/user.validators.js'

const router = express.Router()

// Protected routes - require authentication
router.use(authenticate)

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 */
router.get('/profile', UserController.getProfile)

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security:
 *       - BearerAuth: []
 */
router.put('/profile', validate(updateProfileSchema), UserController.updateProfile)

/**
 * @swagger
 * /api/users/statistics:
 *   get:
 *     tags: [Users]
 *     summary: Get user statistics
 */
router.get('/statistics', UserController.getStatistics)

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload avatar
 */
router.post('/avatar', UserController.uploadAvatar)

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     tags: [Users]
 *     summary: Search users
 */
router.get('/search', validate(searchUsersSchema, 'query'), UserController.searchUsers)

/**
 * @swagger
 * /api/users:
 *   delete:
 *     tags: [Users]
 *     summary: Delete account
 */
router.delete('/', UserController.deleteAccount)

export default router
