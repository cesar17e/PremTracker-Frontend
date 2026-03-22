import { fetchProtectedApi } from "@/lib/api/client";
import type { AdminSyncResponse } from "@/types/admin";

export function runAdminSyncRequest() {
  return fetchProtectedApi<AdminSyncResponse>("/api/admin/sync-games", {
    method: "POST",
  });
}
