import type { AppApiError, ApiErrorPayload } from "@/types/api";

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return isObjectLike(value);
}

export function isAppApiError(value: unknown): value is AppApiError {
  return (
    isObjectLike(value) &&
    typeof value.status === "number" &&
    typeof value.message === "string"
  );
}

export function extractApiError(
  payload: unknown,
  fallback = "Something went wrong."
): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (!isObjectLike(payload)) {
    return fallback;
  }

  const error = payload.error;
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  const message = payload.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return fallback;
}
