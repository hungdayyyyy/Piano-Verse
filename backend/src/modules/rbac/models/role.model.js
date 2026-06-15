export const RoleType = {
  USER: 'user',
  TEACHER: 'teacher',
  ADMIN: 'admin',
}

export const DEFAULT_ROLES = {
  [RoleType.USER]: {
    id: 'role-user',
    name: RoleType.USER,
    description: 'Regular user with access to courses and practice',
    permissions: ['course:view', 'practice:create', 'profile:update'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [RoleType.TEACHER]: {
    id: 'role-teacher',
    name: RoleType.TEACHER,
    description: 'Teacher with course creation and management',
    permissions: [
      'course:create',
      'course:edit',
      'course:delete',
      'lesson:create',
      'lesson:edit',
      'student:view',
      'profile:update',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [RoleType.ADMIN]: {
    id: 'role-admin',
    name: RoleType.ADMIN,
    description: 'Administrator with full system access',
    permissions: [
      'admin:access',
      'user:manage',
      'course:manage',
      'role:manage',
      'system:settings',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}
