import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api/baseQuery";
import type {
  ApiResponse,
  AdminStats,
  User,
  UserRole,
  UserStatus,
} from "@/lib/api/types";

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  status?: UserStatus;
  role?: UserRole;
}

export interface UpdateUserInput {
  role?: UserRole;
  status?: UserStatus;
  skillLevel?: string;
}

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminUsers", "AdminStats"],
  endpoints: (builder) => ({
    // GET /api/admin/stats
    getStats: builder.query<ApiResponse<AdminStats>, void>({
      query: () => "/admin/stats",
      providesTags: ["AdminStats"],
    }),

    // GET /api/admin/users?page=&limit=&status=&role=
    getUsers: builder.query<
      ApiResponse<{ users: User[]; pagination: { total: number; page: number; pages: number; limit: number } }>,
      AdminUsersQuery
    >({
      query: ({ page = 1, limit = 20, status, role } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.set("status", status);
        if (role) params.set("role", role);
        return `/admin/users?${params.toString()}`;
      },
      providesTags: ["AdminUsers"],
    }),

    // GET /api/admin/users/search?q=&limit=
    searchUsers: builder.query<
      ApiResponse<User[]>,
      { q: string; limit?: number }
    >({
      query: ({ q, limit = 10 }) =>
        `/admin/users/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    }),

    // GET /api/admin/users/:id
    getUser: builder.query<ApiResponse<User>, string>({
      query: (id) => `/admin/users/${id}`,
    }),

    // PUT /api/admin/users/:id
    updateUser: builder.mutation<
      ApiResponse<User>,
      { id: string; data: UpdateUserInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    // POST /api/admin/users/:id/suspend
    suspendUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/admin/users/${id}/suspend`,
        method: "POST",
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    // POST /api/admin/users/:id/activate
    activateUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/admin/users/${id}/activate`,
        method: "POST",
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    // DELETE /api/admin/users/:id (soft delete)
    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUsers"],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetUsersQuery,
  useSearchUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
  useDeleteUserMutation,
} = adminApi;
