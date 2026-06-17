"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, UserRole } from "@/lib/api/types";
import { COOKIE_NAMES } from "@/lib/auth/cookieNames";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

function readUserCookie(): Partial<User> | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAMES.USER}=`));
    if (!match) return null;
    return JSON.parse(decodeURIComponent(match.split("=")[1])) as Partial<User>;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  role: null,
  isAuthenticated: false,
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; accessToken: string }>,
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.user.role;
      state.isAuthenticated = true;
      state.isHydrated = true;
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      state.isAuthenticated = false;
    },
    hydrateFromCookie(state) {
      if (state.isHydrated) return;
      const cookieUser = readUserCookie();
      if (cookieUser?._id) {
        state.user = cookieUser as User;
        state.role = (cookieUser.role as UserRole) ?? null;
        state.isAuthenticated = true;
      }
      state.isHydrated = true;
    },
  },
});

export const {
  setCredentials,
  setAccessToken,
  updateUser,
  clearAuth,
  hydrateFromCookie,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectRole = (state: { auth: AuthState }) => state.auth.role;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }) =>
  state.auth.accessToken;
export const selectIsHydrated = (state: { auth: AuthState }) =>
  state.auth.isHydrated;
