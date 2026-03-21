export type TeamListItem = {
  id: number;
  externalTeamId: number;
  name: string;
  shortName: string | null;
  symbolicName: string | null;
  color: string | null;
  awayColor: string | null;
  logoUrl: string | null;
  imageVersion: number | null;
};

export type TeamsResponse = TeamListItem[];

export type TeamMini = {
  id: number;
  name: string | null;
  shortName: string | null;
  color: string | null;
  awayColor: string | null;
  imageVersion: number | null;
};

export type TeamMatch = {
  id: number;
  externalGameId: number;
  startTime: string;
  statusText: string | null;
  ended: boolean;
  homeTeam: TeamMini | null;
  awayTeam: TeamMini | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: number | null;
  perspective: {
    teamIsHome: boolean;
    result: "W" | "D" | "L" | null;
  };
};

export type TeamSummaryResponse = {
  team: TeamListItem;
  lastResults: TeamMatch[];
  nextFixtures: TeamMatch[];
};
