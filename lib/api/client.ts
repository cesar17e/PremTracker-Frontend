import {
  extractApiError,
  isApiErrorPayload,
  isAppApiError,
} from "@/lib/api/errors";
import { getAccessToken, refreshAccessToken } from "@/lib/auth/session-store";
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

function withHeaders(
  init: RequestInit | undefined,
  headersToApply: Record<string, string>
) {
  const headers = new Headers(init?.headers);

  Object.entries(headersToApply).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return {
    ...init,
    headers,
  };
}

function unauthorizedError(message = "Your session has expired.") {
  return {
    status: 401,
    message,
  } satisfies AppApiError;
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

export function fetchSessionApi<T>(
  path: `/${string}`,
  init?: RequestInit
): Promise<T> {
  return fetchApi<T>(path, {
    ...init,
    credentials: "include",
    cache: "no-store",
  });
}

export async function fetchProtectedApi<T>(
  path: `/${string}`,
  init?: RequestInit
): Promise<T> {
  let token = getAccessToken();

  if (!token) {
    token = await refreshAccessToken();
  }

  if (!token) {
    throw unauthorizedError();
  }

  try {
    return await fetchApi<T>(
      path,
      withHeaders(
        {
          ...init,
          cache: "no-store",
        },
        {
          Authorization: `Bearer ${token}`,
        }
      )
    );
  } catch (error) {
    if (!isAppApiError(error) || error.status !== 401) {
      throw error;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      throw unauthorizedError();
    }

    return fetchApi<T>(
      path,
      withHeaders(
        {
          ...init,
          cache: "no-store",
        },
        {
          Authorization: `Bearer ${refreshedToken}`,
        }
      )
    );
  }
}

export type { ApiErrorPayload };
