type SearchParamsReader = {
  get: (key: string) => string | null;
};

export type VerifyPageState = {
  status: "success" | "error" | null;
  message: string | null;
  token: string | null;
};

function normalizeParam(value: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function parseResetTokenFromSearchParams(searchParams: SearchParamsReader) {
  return normalizeParam(searchParams.get("token"));
}

export function parseVerifyPageState(searchParams: SearchParamsReader): VerifyPageState {
  const statusParam = normalizeParam(searchParams.get("status"));
  const status =
    statusParam === "success" || statusParam === "error" ? statusParam : null;

  return {
    status,
    message: normalizeParam(searchParams.get("message")),
    token: normalizeParam(searchParams.get("token")),
  };
}
