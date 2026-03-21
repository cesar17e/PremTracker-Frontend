import type { TeamListItem } from "@/types/teams";
import { TeamCrest } from "@/components/teams/team-crest";

function normalizeHexColor(color: string | null) {
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

function getTeamAccent(team: TeamListItem) {
  return normalizeHexColor(team.color) ?? "var(--color-primary)";
}

function getTeamMeta(team: TeamListItem) {
  if (team.shortName && team.symbolicName) {
    return `${team.shortName} · ${team.symbolicName}`;
  }

  return team.shortName || team.symbolicName || "Club profile";
}

export function TeamCard({ team }: { team: TeamListItem }) {
  const accent = getTeamAccent(team);

  return (
    <article className="surface-card group overflow-hidden rounded-[1.6rem]">
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <TeamCrest team={team} accent={accent} />

            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-base-content">
                {team.name}
              </p>
              <p className="mt-1 text-sm text-base-content/68">
                {getTeamMeta(team)}
              </p>
            </div>
          </div>

          <span className="rounded-full border border-base-content/10 bg-base-content/[0.04] px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
            {team.shortName || "EPL"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.15rem] border border-base-content/10 bg-base-content/[0.04] p-3.5">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
              Focus
            </p>
            <p className="mt-2 text-sm leading-6 text-base-content/78">
              Form, fixtures, and trend views land next for this club.
            </p>
          </div>

          <div className="rounded-[1.15rem] border border-base-content/10 bg-base-content/[0.04] p-3.5">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
              Ready
            </p>
            <p className="mt-2 text-sm leading-6 text-base-content/78">
              This club is already available inside your authenticated workspace.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
