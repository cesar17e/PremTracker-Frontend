"use client";

import { FavoriteButton } from "@/components/teams/favorite-button";
import { TeamCrest } from "@/components/teams/team-crest";
import { PendingLink } from "@/components/ui/pending-link";
import { formatMatchDate } from "@/lib/format/dates";
import { getTeamAccentColor } from "@/lib/teams/presentation";
import type { FavoriteTeam } from "@/types/me";

export function FavoritesList({ favorites }: { favorites: FavoriteTeam[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {favorites.map((team) => {
        const accent = getTeamAccentColor(team);

        return (
          <article
            key={team.id}
            className="surface-card rounded-[1.6rem] border border-base-content/10 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <TeamCrest team={team} accent={accent} />
                <div className="min-w-0">
                  <p className="text-lg font-semibold tracking-[-0.02em] text-base-content">
                    {team.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-base-content/68">
                    Saved on {formatMatchDate(team.favoritedAt)}
                  </p>
                </div>
              </div>

              <FavoriteButton team={team} compact />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-base-content/10 bg-base-content/[0.04] px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                Favorite club
              </span>
              {team.shortName ? (
                <span className="rounded-full border border-base-content/10 bg-base-content/[0.04] px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                  {team.shortName}
                </span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <PendingLink
                href={`/teams/${team.id}`}
                pendingLabel="Opening..."
                className="btn btn-primary w-full rounded-full px-5 sm:w-auto"
              >
                Open analytics
              </PendingLink>
              <p className="text-sm leading-6 text-base-content/64">
                Keep this club handy for quick access and reminder emails.
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
