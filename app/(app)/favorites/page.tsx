"use client";

import { FavoritesList } from "@/components/teams/favorites-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatusAlert } from "@/components/ui/status-alert";
import { useFavorites } from "@/hooks/use-favorites";

function FavoritesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="surface-card rounded-[1.6rem] p-5">
          <LoadingSkeleton className="h-5 w-40 rounded-full" />
          <LoadingSkeleton className="mt-3 h-4 w-56 rounded-full" />
          <LoadingSkeleton className="mt-5 h-11 rounded-[1.2rem]" />
        </div>
      ))}
    </div>
  );
}

export default function FavoritesPage() {
  const { favorites, status, errorMessage, refreshFavorites } = useFavorites();

  return (
    <div className="w-full max-w-6xl space-y-5">
      <section className="rounded-[1.7rem] border border-base-content/10 bg-base-content/[0.04] p-5 sm:p-6">
        <p className="section-kicker">Favorites</p>
        <h1 className="mt-3 text-[1.85rem] font-semibold tracking-[-0.03em] text-base-content">
          Saved clubs and quick access
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/70">
          Keep the clubs you follow close at hand so you can jump back into analytics and use
          reminder features from one place.
        </p>
      </section>

      {status === "loading" ? <FavoritesSkeleton /> : null}

      {status === "error" ? (
        <div className="space-y-4">
          <StatusAlert
            variant="error"
            title="We couldn't load your favorites"
            description={errorMessage ?? "Please try again."}
          />
          <button
            type="button"
            className="btn btn-primary rounded-full px-6"
            onClick={() => void refreshFavorites()}
          >
            Try again
          </button>
        </div>
      ) : null}

      {status === "ready" && !favorites.length ? (
        <EmptyState
          eyebrow="No saved clubs"
          title="You have not saved any clubs yet"
          description="Use the save button on a team card or team detail page to build your favorites list."
        />
      ) : null}

      {status === "ready" && favorites.length ? (
        <FavoritesList favorites={favorites} />
      ) : null}
    </div>
  );
}
