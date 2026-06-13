import { BaseRepository } from '../../../common/repositories/base.repository.js'
import CompositionModel from '../models/composition.model.js'

export class CompositionRepository extends BaseRepository {
  constructor() {
    super(CompositionModel)
  }

  async getUserCompositions(userId) {
    return this.model.find({ userId }).sort({ createdAt: -1 }).lean()
  }

  async getPublicCompositions(limit = 50) {
    return this.model
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  async searchCompositions(query) {
    return this.model
      .find({
        isPublic: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      })
      .lean()
  }

  async makePublic(compositionId) {
    return this.model.findByIdAndUpdate(compositionId, { isPublic: true }, { new: true }).lean()
  }

  async makePrivate(compositionId) {
    return this.model.findByIdAndUpdate(compositionId, { isPublic: false }, { new: true }).lean()
  }

  async getTrendingCompositions(limit = 20) {
    return this.model
      .find({ isPublic: true })
      .sort({ likes: -1, createdAt: -1 })
      .limit(limit)
      .lean()
  }
}
