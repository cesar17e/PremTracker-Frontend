import { fetchProtectedApi } from "@/lib/api/client";
import type {
  FixtureDifficultyResponse,
  MatchType,
  TeamFormResponse,
  TeamMatchesResponse,
  TeamSummaryResponse,
  TeamsResponse,
  TeamTrendsResponse,
} from "@/types/teams";

function withQuery(
  path: `/${string}`,
  params: Record<string, string | number | boolean | undefined>
) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return (query ? `${path}?${query}` : path) as `/${string}`;
}

export function getTeams() {
  return fetchProtectedApi<TeamsResponse>("/api/teams");
}

export function getTeamSummary(teamId: number) {
  return fetchProtectedApi<TeamSummaryResponse>(`/api/teams/${teamId}/summary`);
}

export function getTeamMatches(teamId: number, type: MatchType, limit = 12) {
  return fetchProtectedApi<TeamMatchesResponse>(
    withQuery(`/api/teams/${teamId}/matches`, { type, limit })
  );
}

export function getTeamForm(teamId: number, matches = 10) {
  return fetchProtectedApi<TeamFormResponse>(
    withQuery(`/api/teams/${teamId}/form`, { matches })
  );
}

export function getTeamTrends(teamId: number, matches = 20, window = 5) {
  return fetchProtectedApi<TeamTrendsResponse>(
    withQuery(`/api/teams/${teamId}/trends`, { matches, window })
  );
}

export function getTeamFixtureDifficulty(teamId: number, fixtures = 5) {
  return fetchProtectedApi<FixtureDifficultyResponse>(
    withQuery(`/api/teams/${teamId}/fixture-difficulty`, {
      fixtures,
      oppMatches: 15,
      recentOppMatches: 5,
      alpha: 0.4,
    })
  );
}
