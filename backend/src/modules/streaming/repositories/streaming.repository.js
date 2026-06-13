import { BaseRepository } from '../../../common/repositories/base.repository.js'
import TrackModel from '../models/track.model.js'

export class StreamingRepository extends BaseRepository {
  constructor() {
    super(TrackModel)
  }

  async getMostPlayed(limit = 20) {
    return this.model
      .find()
      .sort({ playCount: -1 })
      .limit(limit)
      .lean()
  }

  async getByArtist(artist) {
    return this.model.find({ artist }).lean()
  }

  async getByDifficulty(difficulty) {
    return this.model.find({ difficulty }).lean()
  }

  async searchTracks(query) {
    return this.model
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { artist: { $regex: query, $options: 'i' } },
        ],
      })
      .lean()
  }

  async incrementPlayCount(trackId) {
    await this.model.findByIdAndUpdate(trackId, { $inc: { playCount: 1 } })
  }

  async getRecentlyPlayed(userId, limit = 20) {
    const PlayHistory = require('../models/play-history.model').default
    return PlayHistory.find({ userId })
      .populate('trackId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }
}
