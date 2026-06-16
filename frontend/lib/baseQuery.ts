import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import type { ApiError } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Raw base query (no auth) ─────────────────────────────────────────────────
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
  credentials: "include",
});

// ─── Response transformer - unwraps envelope ──────────────────────────────────
export function transformApiResponse<T>(response: {
  success: boolean;
  data?: T;
  message?: string;
}): T {
  if (!response.success) {
    throw new Error(response.message || "Request failed");
  }
  return response.data as T;
}

// ─── Error transformer ────────────────────────────────────────────────────────
export function transformApiError(error: FetchBaseQueryError): ApiError {
  if (error.status === "FETCH_ERROR") {
    return {
      status: 0,
      message: "Network error. Please check your connection.",
    };
  }
  if (error.status === "PARSING_ERROR") {
    return {
      status: error.originalStatus,
      message: "Invalid server response.",
    };
  }
  const data = error.data as { message?: string; code?: string } | undefined;
  return {
    status: Number(error.status),
    message: data?.message || "An unexpected error occurred.",
    code: data?.code,
  };
}

// ─── Auto-refresh base query ──────────────────────────────────────────────────
// On 401, attempts to refresh the access token via our Route Handler,
// then retries the original request once.
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt token refresh via Next.js Route Handler (handles cookie storage)
    const refreshResult = await fetch("/api/auth/refresh", { method: "POST" });

    if (refreshResult.ok) {
      const refreshData = (await refreshResult.json()) as {
        accessToken?: string;
      };
      if (refreshData.accessToken) {
        // Update store with new access token
        const { setAccessToken } = await import("@/features/auth/authSlice");
        api.dispatch(setAccessToken(refreshData.accessToken));
        // Retry original request
        result = await rawBaseQuery(args, api, extraOptions);
      }
    } else {
      // Refresh failed — clear auth state
      const { clearAuth } = await import("@/features/auth/authSlice");
      api.dispatch(clearAuth());
    }
  }

  return result;
};

// ─── Multipart base query (for file uploads) ──────────────────────────────────
export const multipartBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api`,
  prepareHeaders: (headers: any, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    // Do NOT set Content-Type — browser sets it with boundary for multipart
    return headers;
  },
});
