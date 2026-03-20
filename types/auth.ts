export type AuthSessionUser = {
  id: number;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
};

export type LoginResponse = {
  user: {
    id: number;
    email: string;
    emailVerified: boolean;
  };
  accessToken: string;
};

export type AuthMeResponse = {
  user: {
    id: number;
    email: string;
    email_verified: boolean;
    is_admin: boolean;
  };
};

export type RefreshResponse = {
  accessToken: string;
};
