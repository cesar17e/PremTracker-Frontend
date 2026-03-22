import { fetchApi, fetchProtectedApi, fetchSessionApi } from "@/lib/api/client";
import type {
  AuthMeResponse,
  AuthResponseUser,
  AuthSessionUser,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  ResetPasswordResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailResponse,
} from "@/types/auth";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export function mapAuthResponseUser(user: AuthResponseUser): AuthSessionUser {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    isAdmin: false,
  };
}

export function mapAuthMeUser(response: AuthMeResponse["user"]): AuthSessionUser {
  return {
    id: response.id,
    email: response.email,
    emailVerified: response.email_verified,
    isAdmin: response.is_admin,
  };
}

export function loginRequest(input: LoginRequest) {
  return fetchSessionApi<LoginResponse>("/api/auth/login", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
}

export function registerRequest(input: RegisterRequest) {
  return fetchSessionApi<RegisterResponse>("/api/auth/register", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
}

export function refreshSessionRequest() {
  return fetchSessionApi<RefreshResponse>("/api/auth/refresh", {
    method: "POST",
  });
}

export function logoutRequest() {
  return fetchSessionApi<LogoutResponse>("/api/auth/logout", {
    method: "POST",
  });
}

export function forgotPasswordRequest(email: string) {
  return fetchApi<ForgotPasswordResponse>("/api/auth/forgot-password", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email }),
  });
}

export function resetPasswordRequest(token: string, newPassword: string) {
  return fetchApi<ResetPasswordResponse>("/api/auth/reset-password", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ token, newPassword }),
  });
}

export function verifyEmailTokenRequest(token: string) {
  return fetchApi<VerifyEmailResponse>(
    `/api/auth/verify-email?token=${encodeURIComponent(token)}`
  );
}

export function getAuthMe(accessToken: string) {
  return fetchProtectedApi<AuthMeResponse>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
