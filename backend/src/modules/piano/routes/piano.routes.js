import express from 'express'
import { PianoService } from '../services/piano.service.js'
import { authenticate } from '../../../common/middleware/auth.middleware.js'
import { asyncHandler } from '../../../common/utils/async-handler.js'

const router = express.Router()
const pianoService = new PianoService()

/**
 * @swagger
 * /api/piano/samples:
 *   get:
 *     tags: [Piano]
 *     summary: Get piano sound samples
 *     responses:
 *       200:
 *         description: Sound samples
 */
router.get(
  '/samples',
  asyncHandler(async (req, res) => {
    const samples = await pianoService.getSoundSamples()
    res.json({ success: true, data: samples })
  })
)

/**
 * @swagger
 * /api/piano/config:
 *   get:
 *     tags: [Piano]
 *     summary: Get piano configuration
 */
router.get(
  '/config',
  asyncHandler(async (req, res) => {
    const config = await pianoService.getPianoConfig()
    res.json({ success: true, data: config })
  })
)

/**
 * @swagger
 * /api/piano/midi-mappings:
 *   get:
 *     tags: [Piano]
 *     summary: Get MIDI to note mappings
 */
router.get(
  '/midi-mappings',
  asyncHandler(async (req, res) => {
    const mappings = await pianoService.getMidiMappings()
    res.json({ success: true, data: mappings })
  })
)

/**
 * @swagger
 * /api/piano/sheet-music:
 *   get:
 *     tags: [Piano]
 *     summary: List available sheet music
 */
router.get(
  '/sheet-music',
  asyncHandler(async (req, res) => {
    const { difficulty } = req.query
    const sheets = await pianoService.listSheetMusic(difficulty)
    res.json({ success: true, data: sheets })
  })
)

/**
 * @swagger
 * /api/piano/sheet-music/{id}:
 *   get:
 *     tags: [Piano]
 *     summary: Get sheet music by ID
 */
router.get(
  '/sheet-music/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const sheet = await pianoService.getSheetMusic(id)

    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Sheet music not found' })
    }

    res.json({ success: true, data: sheet })
  })
)

/**
 * @swagger
 * /api/piano/recordings:
 *   post:
 *     tags: [Piano]
 *     summary: Save a recording
 *     security:
 *       - BearerAuth: []
 */
router.post(
  '/recordings',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const recording = await pianoService.saveRecording(userId, req.body)
    res.status(201).json({ success: true, data: recording })
  })
)

/**
 * @swagger
 * /api/piano/recordings:
 *   get:
 *     tags: [Piano]
 *     summary: Get user recordings
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/recordings',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const recordings = await pianoService.getUserRecordings(userId)
    res.json({ success: true, data: recordings })
  })
)

export default router
