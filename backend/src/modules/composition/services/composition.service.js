export class CompositionService {
  async createComposition(userId, data) {
    return {
      id: `comp-${Date.now()}`,
      user_id: userId,
      title: data.title,
      description: data.description,
      music_data: data.music_data || '{}',
      duration_seconds: data.duration_seconds || 0,
      is_public: data.is_public || false,
      created_at: new Date(),
    }
  }

  async getUserCompositions(userId) {
    return []
  }

  async getCompositionById(compositionId) {
    return null
  }

  async updateComposition(userId, compositionId, data) {
    return {}
  }

  async deleteComposition(userId, compositionId) {
    return { success: true }
  }

  async getPublicCompositions() {
    return []
  }
}
