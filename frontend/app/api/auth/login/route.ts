import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/session";
import type { ApiResponse, AuthResponse } from "@/lib/api/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as ApiResponse<AuthResponse>;

    if (!res.ok || !data.success || !data.data) {
      return NextResponse.json(
        { success: false, message: data.message || "Login failed" },
        { status: res.status }
      );
    }

    // Set httpOnly cookies server-side
    await setAuthCookies(data.data.tokens, data.data.user);

    // Return user info + access token to client (client needs it for RTK Query header injection)
    return NextResponse.json({
      success: true,
      data: {
        user: data.data.user,
        accessToken: data.data.tokens.accessToken,
      },
    });
  } catch (err) {
    console.error("[auth/login] error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
