import http, { type ApiResponse } from "@/services/http";
import { USER_URLS } from "./users.urls";
import type { User, UserStatistics } from "@/lib/api/types";

export interface UpdateProfilePayload {
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

const usersService = {
  getProfile(): Promise<ApiResponse<User>> {
    return http.get<User>(USER_URLS.PROFILE);
  },

  updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<User>> {
    return http.put<User>(USER_URLS.PROFILE, payload);
  },

  getStatistics(): Promise<ApiResponse<UserStatistics>> {
    return http.get<UserStatistics>(USER_URLS.STATISTICS);
  },

  uploadAvatar(formData: FormData): Promise<ApiResponse<{ avatar: string }>> {
    return http.upload<{ avatar: string }>(USER_URLS.AVATAR, formData);
  },

  searchUsers(query: string, limit = 10): Promise<ApiResponse<User[]>> {
    return http.get<User[]>(`${USER_URLS.SEARCH}?query=${encodeURIComponent(query)}&limit=${limit}`);
  },

  deleteAccount(): Promise<ApiResponse<null>> {
    return http.delete<null>(USER_URLS.DELETE);
  },
};

export default usersService;
