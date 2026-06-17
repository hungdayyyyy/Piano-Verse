/**
 * ============================================================
 * services/http.ts
 * Base HTTP client — single source of truth cho mọi API call.
 *
 * Xử lý tập trung:
 *  - Inject Authorization header từ Redux store (in-memory token)
 *  - Parse response envelope { success, data, message }
 *  - Toast thông báo lỗi cho người dùng
 *  - Auto-refresh token khi gặp 401
 *  - Timeout 60s
 *  - Network error detection
 * ============================================================
 */

import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const TIMEOUT_MS = 60_000;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface HttpError {
  status: number;
  message: string;
  code?: string;
}

// ─── Token accessor (set by authSlice after login) ────────────────────────────
let _accessToken: string | null = null;

export function setHttpToken(token: string | null) {
  _accessToken = token;
}

export function getHttpToken(): string | null {
  return _accessToken;
}

// ─── User-facing error messages ───────────────────────────────────────────────
function getErrorMessage(status: number, serverMsg?: string): string {
  if (serverMsg) return serverMsg;
  switch (status) {
    case 0:
      return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền.";
    case 400:
      return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
    case 401:
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    case 403:
      return "Bạn không có quyền thực hiện thao tác này.";
    case 404:
      return "Không tìm thấy dữ liệu yêu cầu.";
    case 409:
      return "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại.";
    case 422:
      return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
    case 429:
      return "Bạn thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.";
    case 500:
    case 502:
    case 503:
      return "Hệ thống đang tạm thời gián đoạn. Vui lòng thử lại sau hoặc liên hệ quản trị viên.";
    default:
      return `Hệ thống xảy ra lỗi (SC${status}). Vui lòng thử lại sau.`;
  }
}

// ─── Core request function ────────────────────────────────────────────────────
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  isMultipart?: boolean;
  /** Không toast lỗi — caller tự xử lý */
  silent?: boolean;
  /** Không auto-refresh token khi 401 */
  skipRefresh?: boolean;
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    headers: extraHeaders = {},
    isMultipart = false,
    silent = false,
    skipRefresh = false,
  } = options;

  // Build headers
  const headers: Record<string, string> = { ...extraHeaders };
  if (_accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }
  if (!isMultipart && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  // Timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      method,
      headers,
      body: isMultipart
        ? (body as FormData)
        : body !== undefined
        ? JSON.stringify(body)
        : undefined,
      signal: controller.signal,
      credentials: "include",
    });
  } catch (err) {
    clearTimeout(timeoutId);
    // Network error or timeout
    const isTimeout = (err as Error).name === "AbortError";
    const msg = isTimeout
      ? "Yêu cầu quá thời gian chờ (60s). Vui lòng thử lại."
      : "Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền.";
    if (!silent) toast.error(msg);
    throw { status: 0, message: msg } satisfies HttpError;
  }

  clearTimeout(timeoutId);

  // ─── 401 → auto refresh token ───────────────────────────────────────
  if (response.status === 401 && !skipRefresh) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry original request once with new token
      return request<T>(path, { ...options, skipRefresh: true });
    } else {
      // Refresh failed — redirect to login
      if (!silent) toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      // Lazy import to avoid circular deps
      const { clearAuth } = await import("@/features/auth/authSlice");
      const { store } = await import("@/store/store");
      store.dispatch(clearAuth());
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw { status: 401, message: "Unauthorized" } satisfies HttpError;
    }
  }

  // ─── Parse response body ─────────────────────────────────────────────
  let data: ApiResponse<T>;
  try {
    data = (await response.json()) as ApiResponse<T>;
  } catch {
    const msg = `Phản hồi từ máy chủ không hợp lệ (SC${response.status}).`;
    if (!silent) toast.error(msg);
    throw { status: response.status, message: msg } satisfies HttpError;
  }

  // ─── Server errors (5xx) ─────────────────────────────────────────────
  if (response.status >= 500) {
    const msg = getErrorMessage(response.status, data?.message);
    if (!silent) toast.error(msg);
    throw { status: response.status, message: msg, code: "SERVER_ERROR" } satisfies HttpError;
  }

  // ─── Client errors (4xx) ─────────────────────────────────────────────
  if (!response.ok || !data.success) {
    const msg = getErrorMessage(response.status, data?.message);
    // 400 validation errors: show but don't redirect
    if (!silent && response.status !== 400) toast.error(msg);
    throw {
      status: response.status,
      message: msg,
    } satisfies HttpError;
  }

  return data;
}

// ─── Auto token refresh (calls Next.js Route Handler) ─────────────────────────
async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (!res.ok) return false;
    const json = (await res.json()) as { accessToken?: string };
    if (json.accessToken) {
      setHttpToken(json.accessToken);
      // Update Redux store
      const { setAccessToken } = await import("@/features/auth/authSlice");
      const { store } = await import("@/store/store");
      store.dispatch(setAccessToken(json.accessToken));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Public HTTP helpers ──────────────────────────────────────────────────────
export const http = {
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "POST", body });
  },

  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "PUT", body });
  },

  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "PATCH", body });
  },

  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "DELETE" });
  },

  upload<T>(path: string, formData: FormData, method: "POST" | "PUT" = "POST") {
    return request<T>(path, { method, body: formData, isMultipart: true });
  },
};

export default http;
