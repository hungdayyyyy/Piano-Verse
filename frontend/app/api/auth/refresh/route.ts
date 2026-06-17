import { NextResponse } from "next/server";
import {
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/session";
import type { ApiResponse, AuthResponse } from "@/lib/api/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST() {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token" },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = (await res.json()) as ApiResponse<AuthResponse>;

    if (!res.ok || !data.success || !data.data) {
      await clearAuthCookies();
      return NextResponse.json(
        { success: false, message: "Session expired" },
        { status: 401 }
      );
    }

    await setAuthCookies(data.data.tokens, data.data.user);

    return NextResponse.json({
      success: true,
      accessToken: data.data.tokens.accessToken,
    });
  } catch (err) {
    console.error("[auth/refresh] error:", err);
    await clearAuthCookies();
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
