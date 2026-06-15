import express from 'express'
import { AdminService } from '../services/admin.service.js'
import { authenticate } from '../../../common/middleware/auth.middleware.js'
import { authorize } from '../../../common/middleware/auth.middleware.js'
import { asyncHandler } from '../../../common/utils/async-handler.js'

const router = express.Router()
const adminService = new AdminService()

router.use(authenticate)
router.use(authorize('admin'))

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get system statistics
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const stats = await adminService.getSystemStats()
    res.json({ success: true, data: stats })
  })
)

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users (paginated)
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, role } = req.query

    const filter = {}
    if (status) filter.status = status
    if (role) filter.role = role

    const result = await adminService.getAllUsers(Number(page), Number(limit), filter)
    res.json({ success: true, ...result })
  })
)

/**
 * @swagger
 * /api/admin/users/search:
 *   get:
 *     tags: [Admin]
 *     summary: Search users
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/users/search',
  asyncHandler(async (req, res) => {
    const { q, limit = 20 } = req.query

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' })
    }

    const users = await adminService.searchUsers(String(q), Number(limit))
    res.json({ success: true, data: users })
  })
)

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user by ID
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const user = await adminService.getUserById(id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json({ success: true, data: user })
  })
)

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update user
 *     security:
 *       - BearerAuth: []
 */
router.put(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const user = await adminService.updateUser(id, req.body)
    res.json({ success: true, data: user })
  })
)

/**
 * @swagger
 * /api/admin/users/{id}/suspend:
 *   post:
 *     tags: [Admin]
 *     summary: Suspend user
 *     security:
 *       - BearerAuth: []
 */
router.post(
  '/users/:id/suspend',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const user = await adminService.suspendUser(id)
    res.json({ success: true, data: user })
  })
)

/**
 * @swagger
 * /api/admin/users/{id}/activate:
 *   post:
 *     tags: [Admin]
 *     summary: Activate user
 *     security:
 *       - BearerAuth: []
 */
router.post(
  '/users/:id/activate',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const user = await adminService.activateUser(id)
    res.json({ success: true, data: user })
  })
)

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete user
 *     security:
 *       - BearerAuth: []
 */
router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    await adminService.deleteUser(id)
    res.json({ success: true, message: 'User deleted successfully' })
  })
)

export default router
