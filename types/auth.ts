import type { UserId } from "@/types/api";

export type AuthSessionUser = {
  id: UserId;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
};

export type AuthResponseUser = {
  id: UserId;
  email: string;
  emailVerified: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: AuthResponseUser;
  accessToken: string;
};

export type RegisterResponse = LoginResponse & {
  emailVerificationSent?: boolean;
  verifyLink?: string;
};

export type AuthMeResponse = {
  user: {
    id: UserId;
    email: string;
    email_verified: boolean;
    is_admin: boolean;
  };
};

export type RefreshResponse = {
  accessToken: string;
};

export type LogoutResponse = {
  ok: boolean;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
