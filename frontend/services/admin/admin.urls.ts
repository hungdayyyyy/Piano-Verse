export const ADMIN_URLS = {
  STATS: "/admin/stats",
  USERS: "/admin/users",
  USER: (id: string) => `/admin/users/${id}`,
  USER_SEARCH: "/admin/users/search",
  SUSPEND: (id: string) => `/admin/users/${id}/suspend`,
  ACTIVATE: (id: string) => `/admin/users/${id}/activate`,
} as const;
