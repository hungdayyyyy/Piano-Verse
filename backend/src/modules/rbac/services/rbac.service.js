import { DEFAULT_ROLES, RoleType } from '../models/role.model.js'
import { redisClient } from '../../../config/redis.js'

export class RBACService {
  async getUserRole(userId) {
    const cacheKey = `user:role:${userId}`
    const cachedRole = await redisClient.get(cacheKey)
    if (cachedRole) return cachedRole

    // TODO: fetch from DB
    const role = RoleType.USER
    await redisClient.setex(cacheKey, 3600, role)
    return role
  }

  async getUserPermissions(userId) {
    const cacheKey = `user:permissions:${userId}`
    const cached = await redisClient.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const role = await this.getUserRole(userId)
    const permissions = DEFAULT_ROLES[role]?.permissions || []

    await redisClient.setex(cacheKey, 3600, JSON.stringify(permissions))
    return permissions
  }

  async hasPermission(userId, permission) {
    const permissions = await this.getUserPermissions(userId)
    return permissions.includes(permission)
  }

  async hasRole(userId, role) {
    const userRole = await this.getUserRole(userId)
    return userRole === role
  }

  async assignRole(userId, role) {
    const cacheKey = `user:role:${userId}`
    const permKey = `user:permissions:${userId}`

    await redisClient.del(cacheKey)
    await redisClient.del(permKey)
    await redisClient.setex(cacheKey, 3600, role)
  }

  async revokeRole(userId) {
    const cacheKey = `user:role:${userId}`
    const permKey = `user:permissions:${userId}`

    await redisClient.del(cacheKey)
    await redisClient.del(permKey)
  }
}
