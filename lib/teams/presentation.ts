type TeamPresentationInput = {
  name: string;
  shortName: string | null;
  symbolicName?: string | null;
  color: string | null;
};

export function normalizeHexColor(color: string | null) {
  if (!color) {
    return null;
  }

  const trimmed = color.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return trimmed;
  }

  if (/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return `#${trimmed}`;
  }

  return null;
}

export function getTeamAccentColor(team: Pick<TeamPresentationInput, "color">) {
  return normalizeHexColor(team.color) ?? "var(--color-primary)";
}

export function getTeamMetaLine(team: TeamPresentationInput) {
  if (team.shortName && team.symbolicName) {
    return `${team.shortName} · ${team.symbolicName}`;
  }

  return team.shortName || team.symbolicName || `${team.name} profile`;
}

export function getCompactTeamLabel(
  team: Pick<TeamPresentationInput, "shortName" | "symbolicName">
) {
  return team.shortName || team.symbolicName || "EPL";
}
