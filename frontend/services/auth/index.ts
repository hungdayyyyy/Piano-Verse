/**
 * Auth Service
 *
 * Login/Register đi qua Next.js Route Handlers (/api/auth/*)
 * để server có thể set httpOnly cookies.
 *
 * Các call còn lại (reset password, validate) đi thẳng backend.
 */

import http, { type ApiResponse } from "@/services/http";
import { AUTH_URLS } from "./auth.urls";
import type {
  RegisterPayload,
  LoginPayload,
  AuthResult,
  AuthTokens,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
} from "./auth.types";

/**
 * Đăng ký tài khoản mới.
 * Gọi qua Next.js Route Handler để set httpOnly cookie.
 */
async function register(payload: RegisterPayload): Promise<{
  user: AuthResult["user"];
  accessToken: string;
}> {
  // Đi qua /api/auth/register (Next.js RH) → backend → set cookie → trả về user + accessToken
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as ApiResponse<{ user: AuthResult["user"]; accessToken: string }>;
  if (!res.ok || !json.success || !json.data) {
    throw { status: res.status, message: json.message || "Đăng ký thất bại" };
  }
  return json.data;
}

/**
 * Đăng nhập.
 * Gọi qua Next.js Route Handler để set httpOnly cookie.
 */
async function login(payload: LoginPayload): Promise<{
  user: AuthResult["user"];
  accessToken: string;
}> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as ApiResponse<{ user: AuthResult["user"]; accessToken: string }>;
  if (!res.ok || !json.success || !json.data) {
    throw { status: res.status, message: json.message || "Đăng nhập thất bại" };
  }
  return json.data;
}

/**
 * Đăng xuất — xóa cookie qua Route Handler.
 */
async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

/**
 * Refresh access token — gọi Route Handler (đọc cookie).
 */
async function refreshToken(): Promise<{ accessToken: string } | null> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (!res.ok) return null;
    const json = (await res.json()) as { accessToken?: string };
    return json.accessToken ? { accessToken: json.accessToken } : null;
  } catch {
    return null;
  }
}

/**
 * Yêu cầu gửi email reset mật khẩu.
 * Gọi thẳng backend (không cần cookie).
 */
async function requestPasswordReset(payload: RequestPasswordResetPayload): Promise<ApiResponse<null>> {
  return http.post<null>(AUTH_URLS.REQUEST_PASSWORD_RESET, payload, { silent: true });
}

/**
 * Đặt lại mật khẩu với token từ email.
 */
async function resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<null>> {
  return http.post<null>(AUTH_URLS.RESET_PASSWORD, payload, { silent: true });
}

/**
 * Validate access token hiện tại.
 */
async function validateToken(): Promise<ApiResponse<object>> {
  return http.get<object>(AUTH_URLS.VALIDATE);
}

const authService = {
  register,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  validateToken,
};

export default authService;
