import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api/baseQuery";
import type {
  ApiResponse,
  AuthResponse,
  AuthTokens,
} from "@/lib/api/types";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
} from "./schemas";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // POST /api/auth/register
    register: builder.mutation<
      ApiResponse<AuthResponse>,
      RegisterInput
    >({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    // POST /api/auth/login
    login: builder.mutation<
      ApiResponse<AuthResponse>,
      LoginInput
    >({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),

    // POST /api/auth/refresh
    refresh: builder.mutation<
      ApiResponse<AuthTokens>,
      { refreshToken: string }
    >({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
    }),

    // POST /api/auth/request-password-reset
    requestPasswordReset: builder.mutation<
      ApiResponse<null>,
      ForgotPasswordInput
    >({
      query: (body) => ({
        url: "/auth/request-password-reset",
        method: "POST",
        body,
      }),
    }),

    // POST /api/auth/reset-password
    resetPassword: builder.mutation<
      ApiResponse<null>,
      { token: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    // GET /api/auth/validate
    validateToken: builder.query<ApiResponse<object>, void>({
      query: () => "/auth/validate",
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useValidateTokenQuery,
} = authApi;
