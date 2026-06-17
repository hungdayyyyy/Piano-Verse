// server-only — never import this file from Client Components.
// It depends on "next/headers" which is available only in Server Components
// and Route Handlers (App Router).
import { cookies } from "next/headers";
import type { AuthTokens, User } from "@/lib/api/types";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_COOKIE,
  COOKIE_NAMES,
} from "@/lib/auth/cookie-names";

export { COOKIE_NAMES };

const SECURE = process.env.NODE_ENV === "production";

// ─── Write tokens to HTTP-only cookies (called from Route Handlers) ───────────
export async function setAuthCookies(
  tokens: AuthTokens,
  user: User
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days (matches JWT_EXPIRY default)
    path: "/",
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  // Store non-sensitive user info (role, name) as readable cookie for middleware/client
  cookieStore.set(
    USER_COOKIE,
    JSON.stringify({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      skillLevel: user.skillLevel,
    }),
    {
      httpOnly: false, // Readable by client JS for UI role gating
      secure: SECURE,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    }
  );
}

// ─── Read access token (server-side only) ─────────────────────────────────────
export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

// ─── Read refresh token (server-side only) ────────────────────────────────────
export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

// ─── Read user info (server-side) ─────────────────────────────────────────────
export async function getServerUser(): Promise<Partial<User> | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<User>;
  } catch {
    return null;
  }
}

// ─── Clear all auth cookies ───────────────────────────────────────────────────
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(USER_COOKIE);
}
