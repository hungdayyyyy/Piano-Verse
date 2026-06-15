import { RBACService } from '../../modules/rbac/services/rbac.service.js'

const rbacService = new RBACService()

export const authorize = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      const hasPermission = await rbacService.hasPermission(userId, requiredPermission)

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Insufficient permissions',
        })
      }

      next()
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
      })
    }
  }
}

export const authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      const userRole = await rbacService.getUserRole(userId)

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Insufficient role',
        })
      }

      next()
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Role check failed',
      })
    }
  }
}
