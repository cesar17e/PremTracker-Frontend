import { fetchProtectedApi } from "@/lib/api/client";
import type { TeamsResponse } from "@/types/teams";

export function getTeams() {
  return fetchProtectedApi<TeamsResponse>("/api/teams");
}
