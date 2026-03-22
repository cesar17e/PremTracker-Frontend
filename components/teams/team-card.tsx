import Link from "next/link";
import { FavoriteButton } from "@/components/teams/favorite-button";
import type { TeamListItem } from "@/types/teams";
import { TeamCrest } from "@/components/teams/team-crest";
import {
  getCompactTeamLabel,
  getTeamAccentColor,
  getTeamMetaLine,
} from "@/lib/teams/presentation";

export function TeamCard({ team }: { team: TeamListItem }) {
  const accent = getTeamAccentColor(team);

  return (
    <article className="surface-card group h-full overflow-hidden rounded-[1.6rem] transition-transform duration-150 hover:-translate-y-0.5">
      <Link href={`/teams/${team.id}`} className="block">
        <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <Link href={`/teams/${team.id}`} className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
            <TeamCrest team={team} accent={accent} />

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-lg font-semibold leading-7 tracking-[-0.02em] text-base-content">
                {team.name}
              </p>

              <p className="mt-1 line-clamp-2 text-sm leading-5 text-base-content/68">
                {getTeamMetaLine(team)}
              </p>

              <div className="mt-3">
                <span className="inline-flex rounded-full border border-base-content/10 bg-base-content/[0.04] px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                  {team.symbolicName ?? getCompactTeamLabel(team)}
                </span>
              </div>
            </div>
            </div>
          </Link>

          <FavoriteButton team={team} compact />
        </div>

        <Link href={`/teams/${team.id}`} className="mt-5 block">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.15rem] border border-base-content/10 bg-base-content/[0.04] p-3.5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                Focus
              </p>
              <p className="mt-2 text-sm leading-6 text-base-content/78">
                Form, fixtures, and trend views are available for this club now.
              </p>
            </div>

            <div className="rounded-[1.15rem] border border-base-content/10 bg-base-content/[0.04] p-3.5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                Open
              </p>
              <p className="mt-2 text-sm leading-6 text-base-content/78">
                Jump into the team overview and the deeper analytics tabs.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </article>
  );
}
