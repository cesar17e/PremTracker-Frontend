import { fetchProtectedApi } from "@/lib/api/client";
import type {
  FavoriteTeam,
  FavoritesResponse,
  FixtureEmailResponse,
  SettingsResponse,
  VerifyEmailRequestResponse,
} from "@/types/me";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export type FavoriteTeamCandidate = Pick<
  FavoriteTeam,
  "id" | "externalTeamId" | "name" | "shortName" | "color" | "awayColor" | "imageVersion"
> &
  Partial<Pick<FavoriteTeam, "symbolicName" | "logoUrl">>;

export function getMyFavorites() {
  return fetchProtectedApi<FavoritesResponse>("/api/me/favorites");
}

export function addMyFavorite(teamId: number) {
  return fetchProtectedApi<{ ok: true }>("/api/me/favorites", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ teamId }),
  });
}

export function removeMyFavorite(teamId: number) {
  return fetchProtectedApi<{ ok: true }>(`/api/me/favorites/${teamId}`, {
    method: "DELETE",
  });
}

export function getMySettings() {
  return fetchProtectedApi<SettingsResponse>("/api/me/settings");
}

export function updateMySettings(emailOptIn: boolean) {
  return fetchProtectedApi<SettingsResponse>("/api/me/settings", {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ emailOptIn }),
  });
}

export function requestVerificationEmail() {
  return fetchProtectedApi<VerifyEmailRequestResponse>("/api/auth/request-verify", {
    method: "POST",
  });
}

export function sendFixtureEmail() {
  return fetchProtectedApi<FixtureEmailResponse>("/api/me/email-fixtures", {
    method: "POST",
  });
}
