import { extractApiError, isApiErrorPayload } from "@/lib/api/errors";
import { buildApiUrl } from "@/lib/utils/env";
import type { AppApiError, ApiErrorPayload } from "@/types/api";

async function parsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function toApiError(status: number, payload: unknown): AppApiError {
  return {
    status,
    message: extractApiError(payload, `Request failed with status ${status}`),
    payload: isApiErrorPayload(payload) ? payload : undefined,
  };
}

export async function fetchApi<T>(
  path: `/${string}`,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(buildApiUrl(path), init);
  const payload = await parsePayload(response);

  if (!response.ok) {
    throw toApiError(response.status, payload);
  }

  return payload as T;
}

export type { ApiErrorPayload };
