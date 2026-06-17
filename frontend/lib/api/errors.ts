import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import type { ApiError } from "./types";

export function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === "object" && error != null && "status" in error;
}

export function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === "object" && error != null && "message" in error;
}

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined
): string {
  if (!error) return "Unknown error";

  if (isFetchBaseQueryError(error)) {
    if (error.status === "FETCH_ERROR") return "Network error. Check your connection.";
    if (error.status === "PARSING_ERROR") return "Invalid server response.";
    const data = error.data as ApiError | { message?: string } | undefined;
    return data?.message || `Request failed (${error.status})`;
  }

  return error.message || "Unknown error";
}

export function getFieldErrors(
  error: FetchBaseQueryError | SerializedError | undefined
): Record<string, string> {
  if (!error || !isFetchBaseQueryError(error)) return {};
  const data = error.data as { details?: Record<string, string> } | undefined;
  return data?.details || {};
}

// Backend-defined error codes
export const API_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  USER_EXISTS: "USER_EXISTS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
} as const;
