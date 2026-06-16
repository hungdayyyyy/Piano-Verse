import type { UserRole } from "@/lib/api/types";

interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}

// Client-side only — decodes without verifying (server verifies via backend)
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;
    const padding = "=".repeat((4 - (payloadB64.length % 4)) % 4);
    const decoded = atob(
      payloadB64.replace(/-/g, "+").replace(/_/g, "/") + padding,
    );
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
}

export function getRoleFromToken(token: string): UserRole | null {
  const payload = decodeJWT(token);
  return payload?.role ?? null;
}

// Role hierarchy for UI gating
const ROLE_LEVELS: Record<UserRole, number> = {
  user: 0,
  teacher: 1,
  admin: 2,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

export function isAdmin(role: UserRole | null): boolean {
  return role === "admin";
}

export function isTeacherOrAdmin(role: UserRole | null): boolean {
  return role === "teacher" || role === "admin";
}
