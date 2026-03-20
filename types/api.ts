export type ApiErrorPayload = {
  error?: string;
  message?: string;
  code?: string;
  details?: string;
  [key: string]: unknown;
};

export type AppApiError = {
  status: number;
  message: string;
  payload?: ApiErrorPayload;
};
