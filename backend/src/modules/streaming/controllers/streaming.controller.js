import { StreamingService } from '../services/streaming.service.js'
import { asyncHandler } from '../../../common/utils/async-handler.js'

const streamingService = new StreamingService()

export class StreamingController {
  static getAllTracks = asyncHandler(async (req, res) => {
    const { limit = 50, offset = 0 } = req.query
    const tracks = await streamingService.getAllTracks(Number(limit), Number(offset))
    res.json({ success: true, data: tracks })
  })

  static getMostPlayed = asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query
    const tracks = await streamingService.getMostPlayed(Number(limit))
    res.json({ success: true, data: tracks })
  })

  static getByArtist = asyncHandler(async (req, res) => {
    const { artist } = req.params
    const tracks = await streamingService.getByArtist(artist)
    res.json({ success: true, data: tracks })
  })

  static getByDifficulty = asyncHandler(async (req, res) => {
    const { difficulty } = req.params
    const tracks = await streamingService.getByDifficulty(difficulty)
    res.json({ success: true, data: tracks })
  })

  static searchTracks = asyncHandler(async (req, res) => {
    const { q } = req.query
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' })
    }
    const tracks = await streamingService.searchTracks(String(q))
    res.json({ success: true, data: tracks })
  })

  static playTrack = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { trackId } = req.params

    await streamingService.playTrack(userId, trackId)
    res.json({ success: true, message: 'Play recorded' })
  })

  static getRecentlyPlayed = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { limit = 20 } = req.query

    const tracks = await streamingService.getRecentlyPlayed(userId, Number(limit))
    res.json({ success: true, data: tracks })
  })

  static toggleFavorite = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { trackId } = req.params

    await streamingService.toggleFavorite(userId, trackId)
    res.json({ success: true, message: 'Favorite toggled' })
  })

  static getFavorites = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const favorites = await streamingService.getFavorites(userId)
    res.json({ success: true, data: favorites })
  })
}
