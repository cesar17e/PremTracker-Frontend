export type FavoriteTeam = {
  id: number;
  externalTeamId: number;
  name: string;
  shortName: string | null;
  symbolicName?: string | null;
  color: string | null;
  awayColor: string | null;
  logoUrl?: string | null;
  imageVersion: number | null;
  favoritedAt: string;
};

export type FavoritesResponse = {
  favorites: FavoriteTeam[];
};

export type SettingsResponse = {
  emailVerified: boolean;
  emailOptIn: boolean;
  timeZone: string;
};

export type VerifyEmailRequestResponse = {
  ok: boolean;
  message: string;
  emailVerificationSent?: boolean;
  verifyLink?: string;
};

export type FixtureEmailResponse = {
  ok: boolean;
  sentTo: string;
  favorites: number;
  fixturesFound: number;
  emailSent: boolean;
  mode: string;
};
