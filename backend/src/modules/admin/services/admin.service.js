import { UserRepository } from '../../users/repositories/user.repository.js'

export class AdminService {
  constructor() {
    this.userRepository = new UserRepository()
  }

  async getAllUsers(page = 1, limit = 20, filter = {}) {
    const skip = (page - 1) * limit
    const { data, total } = await this.userRepository.findAll(skip, limit, filter)

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async getUserById(userId) {
    return this.userRepository.findById(userId)
  }

  async updateUser(userId, updateData) {
    return this.userRepository.update(userId, updateData)
  }

  async suspendUser(userId) {
    return this.userRepository.update(userId, { status: 'suspended' })
  }

  async activateUser(userId) {
    return this.userRepository.update(userId, { status: 'active' })
  }

  async deleteUser(userId) {
    return this.userRepository.delete(userId)
  }

  async getSystemStats() {
    const totalUsers = await this.userRepository.count({})
    const activeUsers = await this.userRepository.count({ status: 'active' })
    const suspendedUsers = await this.userRepository.count({ status: 'suspended' })

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
      },
      courses: {
        total: 0,
        published: 0,
      },
      sessions: {
        total: 0,
        today: 0,
      },
    }
  }

  async searchUsers(query, limit = 20) {
    return this.userRepository.search(query, limit)
  }

  async getUsersByRole(role) {
    return this.userRepository.findByRole(role)
  }
}
