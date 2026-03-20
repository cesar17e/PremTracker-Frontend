const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export function getApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is required.");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export function buildApiUrl(path: `/${string}`) {
  return `${getApiBaseUrl()}${path}`;
}
