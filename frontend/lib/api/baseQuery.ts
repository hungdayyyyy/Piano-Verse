/**
 * RTK Query baseQuery — wrapper dùng services/http.ts
 * để tất cả API call đều đi qua 1 chỗ xử lý tập trung.
 */
import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import { setHttpToken } from "@/services/http";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Raw base query dùng fetchBaseQuery (RTK Query tích hợp)
// Token được inject từ Redux store
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      // Sync token vào http client để các direct call cũng có token
      setHttpToken(token);
    }
    return headers;
  },
  credentials: "include",
});

// Auto-refresh on 401
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await fetch("/api/auth/refresh", { method: "POST" });
    if (refreshResult.ok) {
      const data = (await refreshResult.json()) as { accessToken?: string };
      if (data.accessToken) {
        const { setAccessToken } = await import("@/features/auth/authSlice");
        api.dispatch(setAccessToken(data.accessToken));
        setHttpToken(data.accessToken);
        result = await rawBaseQuery(args, api, extraOptions);
      }
    } else {
      const { clearAuth } = await import("@/features/auth/authSlice");
      api.dispatch(clearAuth());
      setHttpToken(null);
    }
  }

  return result;
};

export function transformApiError(error: FetchBaseQueryError) {
  if (error.status === "FETCH_ERROR") return { status: 0, message: "Network error" };
  const data = error.data as { message?: string; code?: string } | undefined;
  return { status: Number(error.status), message: data?.message || "Request failed", code: data?.code };
}
