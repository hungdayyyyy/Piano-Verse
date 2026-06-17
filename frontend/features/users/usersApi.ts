import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth, multipartBaseQuery } from "@/lib/api/baseQuery";
import type { ApiResponse, User, UserStatistics } from "@/lib/api/types";

// Profile update matches backend updateProfileSchema:
// fullName, bio, skillLevel, preferences.{language,theme,notifications,emailUpdates}
export interface UpdateProfileInput {
  fullName?: string;
  bio?: string;
  skillLevel?: "beginner" | "intermediate" | "advanced" | "expert";
  preferences?: {
    language?: "en" | "vi" | "es" | "fr";
    theme?: "light" | "dark";
    notifications?: boolean;
    emailUpdates?: boolean;
  };
}

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Profile", "Statistics"],
  endpoints: (builder) => ({
    // GET /api/users/profile
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => "/users/profile",
      providesTags: ["Profile"],
    }),

    // PUT /api/users/profile
    updateProfile: builder.mutation<ApiResponse<User>, UpdateProfileInput>({
      query: (body) => ({
        url: "/users/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),

    // GET /api/users/statistics (note: currently returns hardcoded zeros)
    getStatistics: builder.query<ApiResponse<UserStatistics>, void>({
      query: () => "/users/statistics",
      providesTags: ["Statistics"],
    }),

    // POST /api/users/avatar (multipart)
    uploadAvatar: builder.mutation<ApiResponse<{ avatar: string }>, FormData>({
      queryFn: async (formData, _api, _extraOptions, _baseQuery) => {
        // Use multipart base query for file upload
        const token = (_api.getState() as { auth: { accessToken: string | null } }).auth.accessToken;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/avatar`,
          {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          }
        );
        const data = await res.json();
        if (!res.ok) return { error: { status: res.status, data } };
        return { data };
      },
      invalidatesTags: ["Profile"],
    }),

    // GET /api/users/search?query=&limit=
    searchUsers: builder.query<
      ApiResponse<User[]>,
      { query: string; limit?: number }
    >({
      query: ({ query, limit = 10 }) =>
        `/users/search?query=${encodeURIComponent(query)}&limit=${limit}`,
    }),

    // DELETE /api/users (soft delete)
    deleteAccount: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "/users",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetStatisticsQuery,
  useUploadAvatarMutation,
  useSearchUsersQuery,
  useDeleteAccountMutation,
} = usersApi;
