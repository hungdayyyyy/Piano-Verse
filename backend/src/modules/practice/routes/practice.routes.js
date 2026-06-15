import express from 'express'
import { PracticeController } from '../controllers/practice.controller.js'
import { authenticate } from '../../../common/middleware/auth.middleware.js'

const router = express.Router()

router.use(authenticate)

router.post('/sessions', PracticeController.recordSession)
router.get('/sessions', PracticeController.getUserSessions)
router.get('/sessions/:sessionId', PracticeController.getSessionDetails)
router.get('/stats', PracticeController.getUserStats)
router.get('/trend', PracticeController.getPracticeTrend)
router.get('/top-performances', PracticeController.getTopPerformances)

export default router
