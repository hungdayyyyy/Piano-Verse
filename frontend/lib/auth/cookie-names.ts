// Cookie name constants — safe to import from both client and server code.
// Do NOT add any imports from "next/headers" or other server-only modules here.

export const ACCESS_TOKEN_COOKIE = "pv_access";
export const REFRESH_TOKEN_COOKIE = "pv_refresh";
export const USER_COOKIE = "pv_user";

export const COOKIE_NAMES = {
  ACCESS_TOKEN: ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN: REFRESH_TOKEN_COOKIE,
  USER: USER_COOKIE,
} as const;
