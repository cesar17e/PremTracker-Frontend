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

export type TeamSummaryTeam = {
  id: number;
  externalTeamId: number;
  name: string;
  shortName: string | null;
  color: string | null;
  awayColor: string | null;
  imageVersion: number | null;
};

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
  team: TeamSummaryTeam;
  lastResults: TeamMatch[];
  nextFixtures: TeamMatch[];
};

export type MatchType = "all" | "results" | "fixtures";

export type TeamMatchesResponse = {
  team: Omit<TeamSummaryTeam, "externalTeamId">;
  type: MatchType;
  limit: number;
  matches: TeamMatch[];
};

export type TeamFormResponse = {
  teamId: number;
  matches: number;
  form: Array<"W" | "D" | "L">;
  points: number;
  ppg: number;
  gf: number;
  ga: number;
  gd: number;
  cleanSheets: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  formRating: null | {
    recentMatches: number;
    baselineMatches: number;
    recentPPG: number;
    baselinePPG: number;
    deltaPPG: number;
    rating: string;
    volatility: {
      recentPointsStd: number;
      label: string;
    };
    confirmation: string;
    deltaGDPerMatch: number;
  };
};

export type TeamTrendsResponse = {
  teamId: number;
  matches: number;
  window: number;
  labels: string[];
  ppgSeries: number[];
  gdPerMatchSeries: number[];
  gfPerMatchSeries: number[];
  gaPerMatchSeries: number[];
};

export type DifficultyLabel = "Easy" | "Medium" | "Hard";

export type FixtureDifficultyResponse = {
  team: TeamSummaryTeam;
  params: {
    fixtures: number;
    oppMatches: number;
    recentOppMatches: number;
    alpha: number;
    homeAway: {
      enabled: boolean;
      homeFactor: number;
      awayFactor: number;
    };
  };
  run: {
    difficultyScore: number;
    label: DifficultyLabel;
    countedFixtures: number;
  };
  items: Array<{
    match: {
      id: number;
      externalGameId: number;
      startTime: string;
      homeAway: "H" | "A";
    };
    opponent: null | {
      id: number;
      name: string | null;
      shortName: string | null;
    };
    opponentMetrics: {
      baselinePPG: number;
      baselineMatches: number;
      recentPPG: number;
      recentMatches: number;
      deltaPPG: number;
      alpha: number;
      oppStrength: number;
    };
    fixtureDifficulty: number;
    fixtureLabel: DifficultyLabel;
  }>;
};
