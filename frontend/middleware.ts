import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAMES } from "@/lib/auth/cookie-names";

// Routes that require authentication
const PROTECTED_PATTERNS = [
  /^\/(dashboard|piano|practice|music|studio|ai|community|profile|courses)(\/|$)/,
];

// Routes that require admin role
const ADMIN_PATTERNS = [/^\/admin(\/|$)/];

// Routes that require teacher or admin role
const TEACHER_PATTERNS = [/^\/music\/upload(\/|$)/];

// Routes accessible only when NOT authenticated (redirect to dashboard if logged in)
const AUTH_ONLY_PATTERNS = [
  /^\/(login|register|forgot-password|reset-password)(\/|$)/,
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userCookie = request.cookies.get(COOKIE_NAMES.USER)?.value;
  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

  const isAuthenticated = Boolean(accessToken && userCookie);

  let role: string | null = null;
  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie)) as {
        role?: string;
      };
      role = user.role ?? null;
    } catch {
      role = null;
    }
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_ONLY_PATTERNS.some((p) => p.test(pathname))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Admin routes
  if (ADMIN_PATTERNS.some((p) => p.test(pathname))) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Teacher-only routes
  if (TEACHER_PATTERNS.some((p) => p.test(pathname))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role !== "teacher" && role !== "admin") {
      return NextResponse.redirect(new URL("/music", request.url));
    }
    return NextResponse.next();
  }

  // General protected routes
  if (PROTECTED_PATTERNS.some((p) => p.test(pathname))) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
};
