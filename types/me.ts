export type FavoriteTeam = {
  id: number;
  externalTeamId: number;
  name: string;
  shortName: string | null;
  color: string | null;
  awayColor: string | null;
  imageVersion: number | null;
  favoritedAt: string;
};

export type SettingsResponse = {
  emailVerified: boolean;
  emailOptIn: boolean;
  timeZone: string;
};
