import { PracticeService } from '../services/practice.service.js'
import { asyncHandler } from '../../../common/utils/async-handler.js'

const practiceService = new PracticeService()

export class PracticeController {
  static recordSession = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { songName, difficulty, durationSeconds, notesHit, notesMissed, accuracyPercentage, recordedNotes } = req.body

    const session = await practiceService.recordSession({
      userId,
      songName,
      difficulty,
      durationSeconds,
      notesHit,
      notesMissed,
      accuracyPercentage,
      recordedNotes,
    })

    res.status(201).json({ success: true, data: session })
  })

  static getUserSessions = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { limit = 10 } = req.query

    const sessions = await practiceService.getUserSessions(userId, Number(limit))
    res.json({ success: true, data: sessions })
  })

  static getSessionDetails = asyncHandler(async (req, res) => {
    const { sessionId } = req.params
    const session = await practiceService.getSessionDetails(sessionId)

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' })
    }

    res.json({ success: true, data: session })
  })

  static getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const stats = await practiceService.getUserStats(userId)
    res.json({ success: true, data: stats })
  })

  static getPracticeTrend = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { days = 7 } = req.query

    const trend = await practiceService.getPracticeTrend(userId, Number(days))
    res.json({ success: true, data: trend })
  })

  static getTopPerformances = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { limit = 5 } = req.query

    const performances = await practiceService.getTopPerformances(userId, Number(limit))
    res.json({ success: true, data: performances })
  })
}
