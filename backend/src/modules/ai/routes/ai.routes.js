import express from 'express'
import { AIService } from '../services/ai.service.js'
import { authenticate } from '../../../common/middleware/auth.middleware.js'
import { asyncHandler } from '../../../common/utils/async-handler.js'

const router = express.Router()
const aiService = new AIService()

router.use(authenticate)

/**
 * @swagger
 * /api/ai/analyze-performance:
 *   post:
 *     tags: [AI]
 *     summary: Analyze practice performance
 *     security:
 *       - BearerAuth: []
 */
router.post(
  '/analyze-performance',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const analysis = await aiService.analyzePerformance(userId, req.body)
    res.json({ success: true, data: analysis })
  })
)

/**
 * @swagger
 * /api/ai/recommendations:
 *   get:
 *     tags: [AI]
 *     summary: Get AI practice recommendations
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/recommendations',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { skillLevel = 'beginner' } = req.query

    const recommendations = await aiService.generatePracticeRecommendations(
      userId,
      skillLevel,
      []
    )
    res.json({ success: true, data: recommendations })
  })
)

/**
 * @swagger
 * /api/ai/composition-ideas:
 *   post:
 *     tags: [AI]
 *     summary: Generate composition ideas
 *     security:
 *       - BearerAuth: []
 */
router.post(
  '/composition-ideas',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { style, mood } = req.body

    const ideas = await aiService.generateCompositionIdeas(userId, style, mood)
    res.json({ success: true, data: ideas })
  })
)

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     tags: [AI]
 *     summary: Chat with AI piano assistant
 *     security:
 *       - BearerAuth: []
 */
router.post(
  '/chat',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { messages } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Messages array required' })
    }

    const response = await aiService.getChatResponse(userId, messages)
    res.json({ success: true, data: { message: response } })
  })
)

export default router
