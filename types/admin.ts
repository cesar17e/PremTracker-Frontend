export type AdminSyncResponse = {
  message: string;
  apiCalls: number;
  uniqueMatches: number;
  upserted: number;
  failed: number;
};
