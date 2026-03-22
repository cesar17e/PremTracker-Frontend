"use client";

import type { FavoriteTeamCandidate } from "@/lib/api/me";
import { useFavorites } from "@/hooks/use-favorites";

type FavoriteButtonProps = {
  team: FavoriteTeamCandidate;
  compact?: boolean;
};

export function FavoriteButton({
  team,
  compact = false,
}: FavoriteButtonProps) {
  const { isFavorite, pendingTeamIds, toggleFavorite } = useFavorites();
  const favorite = isFavorite(team.id);
  const pending = pendingTeamIds.has(team.id);
  const label = pending
    ? favorite
      ? "Removing..."
      : "Saving..."
    : favorite
    ? compact
      ? "Remove"
      : "Remove club"
    : compact
    ? "Save"
    : "Save club";

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={favorite}
      aria-label={label}
      title={label}
      className={`cursor-pointer rounded-full border border-base-content/10 transition ${
        compact
          ? "px-3 py-1.5 text-sm"
          : "px-4 py-2 text-sm font-medium"
      } ${
        favorite
          ? "bg-primary/14 text-primary"
          : "bg-base-content/[0.04] text-base-content/72"
        } disabled:cursor-wait disabled:opacity-70`}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          await toggleFavorite(team.id, team);
        } catch {
          // The provider restores the previous state and stores the error message.
        }
      }}
    >
      {label}
    </button>
  );
}
