"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isAppApiError } from "@/lib/api/errors";
import {
  getAuthMe,
  loginRequest,
  logoutRequest,
  mapAuthMeUser,
  mapAuthResponseUser,
  refreshSessionRequest,
  registerRequest,
} from "@/lib/api/auth";
import {
  clearAccessToken,
  registerRefreshHandler,
  setAccessToken,
} from "@/lib/auth/session-store";
import type {
  AuthSessionUser,
  AuthStatus,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthSessionUser | null;
  lastError: string | null;
  login: (input: LoginRequest) => Promise<void>;
  register: (input: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<AuthSessionUser | null>;
  clearError: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

function getErrorMessage(error: unknown, fallback: string) {
  if (isAppApiError(error)) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function isUnauthorized(error: unknown) {
  return isAppApiError(error) && error.status === 401;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const restorePromiseRef = useRef<Promise<AuthSessionUser | null> | null>(null);

  const resetSession = useCallback((message: string | null = null) => {
    clearAccessToken();
    setUser(null);
    setStatus("unauthenticated");
    setLastError(message);
  }, []);

  const loadUserFromToken = useCallback(async (accessToken: string) => {
    const response = await getAuthMe(accessToken);
    const nextUser = mapAuthMeUser(response.user);

    setAccessToken(accessToken);
    setUser(nextUser);
    setStatus("authenticated");
    setLastError(null);

    return nextUser;
  }, []);

  const refreshAccessTokenEvent = useCallback(async () => {
    try {
      const response = await refreshSessionRequest();
      setAccessToken(response.accessToken);
      setLastError(null);
      return response.accessToken;
    } catch (error) {
      resetSession(isUnauthorized(error) ? null : getErrorMessage(error, "We couldn't restore your session."));
      return null;
    }
  }, [resetSession]);

  const restoreSessionEvent = useCallback(async () => {
    if (restorePromiseRef.current) {
      return restorePromiseRef.current;
    }

    setStatus((currentStatus) =>
      currentStatus === "authenticated" ? currentStatus : "loading"
    );

    const promise = (async () => {
      const accessToken = await refreshAccessTokenEvent();
      if (!accessToken) {
        return null;
      }

      try {
        return await loadUserFromToken(accessToken);
      } catch (error) {
        resetSession(
          isUnauthorized(error)
            ? null
            : getErrorMessage(error, "We couldn't load your account.")
        );
        return null;
      }
    })().finally(() => {
      restorePromiseRef.current = null;
    });

    restorePromiseRef.current = promise;
    return promise;
  }, [loadUserFromToken, refreshAccessTokenEvent, resetSession]);

  useEffect(() => {
    registerRefreshHandler(() => refreshAccessTokenEvent());
    return () => registerRefreshHandler(null);
  }, [refreshAccessTokenEvent]);

  useEffect(() => {
    void restoreSessionEvent();
  }, [restoreSessionEvent]);

  async function login(input: LoginRequest) {
    setLastError(null);

    const response = await loginRequest(input);
    const fallbackUser = mapAuthResponseUser(response.user);

    setAccessToken(response.accessToken);
    setUser(fallbackUser);
    setStatus("authenticated");

    try {
      await loadUserFromToken(response.accessToken);
    } catch (error) {
      if (isUnauthorized(error)) {
        await restoreSessionEvent();
        return;
      }

      setUser(fallbackUser);
      setStatus("authenticated");
      setLastError(null);
    }
  }

  async function register(input: RegisterRequest) {
    setLastError(null);

    const response = await registerRequest(input);
    const fallbackUser = mapAuthResponseUser(response.user);

    setAccessToken(response.accessToken);
    setUser(fallbackUser);
    setStatus("authenticated");

    try {
      await loadUserFromToken(response.accessToken);
    } catch (error) {
      if (isUnauthorized(error)) {
        await restoreSessionEvent();
        return;
      }

      setUser(fallbackUser);
      setStatus("authenticated");
      setLastError(null);
    }
  }

  async function logout() {
    try {
      await logoutRequest();
    } catch {
      // Clear the local session even if the network call fails.
    } finally {
      resetSession(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        lastError,
        login,
        register,
        logout,
        restoreSession: () => restoreSessionEvent(),
        clearError: () => setLastError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
