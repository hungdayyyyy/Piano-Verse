import http, { type ApiResponse } from "@/services/http";
import { ADMIN_URLS } from "./admin.urls";
import type { AdminStats, User, UserRole, UserStatus } from "@/lib/api/types";

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  status?: UserStatus;
  role?: UserRole;
}

export interface AdminUsersResult {
  users: User[];
  pagination: { total: number; page: number; pages: number; limit: number };
}

export interface UpdateUserPayload {
  role?: UserRole;
  status?: UserStatus;
  skillLevel?: string;
}

const adminService = {
  getStats(): Promise<ApiResponse<AdminStats>> {
    return http.get<AdminStats>(ADMIN_URLS.STATS);
  },

  getUsers(params: AdminUsersParams = {}): Promise<ApiResponse<AdminUsersResult>> {
    const { page = 1, limit = 20, status, role } = params;
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) q.set("status", status);
    if (role) q.set("role", role);
    return http.get<AdminUsersResult>(`${ADMIN_URLS.USERS}?${q.toString()}`);
  },

  searchUsers(q: string, limit = 10): Promise<ApiResponse<User[]>> {
    return http.get<User[]>(`${ADMIN_URLS.USER_SEARCH}?q=${encodeURIComponent(q)}&limit=${limit}`);
  },

  getUser(id: string): Promise<ApiResponse<User>> {
    return http.get<User>(ADMIN_URLS.USER(id));
  },

  updateUser(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
    return http.put<User>(ADMIN_URLS.USER(id), payload);
  },

  suspendUser(id: string): Promise<ApiResponse<null>> {
    return http.post<null>(ADMIN_URLS.SUSPEND(id));
  },

  activateUser(id: string): Promise<ApiResponse<null>> {
    return http.post<null>(ADMIN_URLS.ACTIVATE(id));
  },

  deleteUser(id: string): Promise<ApiResponse<null>> {
    return http.delete<null>(ADMIN_URLS.USER(id));
  },
};

export default adminService;
