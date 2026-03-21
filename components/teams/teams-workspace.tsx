"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { StatusAlert } from "@/components/ui/status-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { TeamCard } from "@/components/teams/team-card";
import { isAppApiError } from "@/lib/api/errors";
import { getTeams } from "@/lib/api/teams";
import type { TeamListItem } from "@/types/teams";

type LoadState = "loading" | "ready" | "error";

function getErrorCopy(error: unknown) {
  if (isAppApiError(error) && error.status === 429) {
    return "The teams service is being rate limited right now. Please wait a moment and try again.";
  }

  if (isAppApiError(error)) {
    return error.message;
  }

  return "We couldn't load the Premier League clubs right now.";
}

function TeamGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="surface-card rounded-[1.6rem] p-5">
          <LoadingSkeleton className="h-1.5 rounded-full" />
          <div className="mt-5 flex items-center gap-3">
            <LoadingSkeleton className="h-12 w-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-4 w-2/3 rounded-full" />
              <LoadingSkeleton className="h-3 w-1/2 rounded-full" />
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <LoadingSkeleton className="h-24 rounded-[1.15rem]" />
            <LoadingSkeleton className="h-24 rounded-[1.15rem]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeamsWorkspace() {
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);

  useEffect(() => {
    let isActive = true;

    async function loadTeams() {
      setLoadState("loading");
      setErrorMessage(null);

      try {
        const response = await getTeams();
        if (!isActive) {
          return;
        }

        setTeams(response);
        setLoadState("ready");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(getErrorCopy(error));
        setLoadState("error");
      }
    }

    void loadTeams();

    return () => {
      isActive = false;
    };
  }, []);

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredTeams = teams.filter((team) => {
    if (!normalizedSearch) {
      return true;
    }

    return [team.name, team.shortName ?? "", team.symbolicName ?? ""].some((value) =>
      value.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <div className="w-full max-w-6xl space-y-5">
      <section className="rounded-[1.7rem] border border-base-content/10 bg-base-content/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">Premier League clubs</p>
            <h1 className="mt-3 text-[1.95rem] font-semibold tracking-[-0.03em] text-base-content">
              Choose a club to start with
            </h1>
            <p className="mt-3 text-sm leading-6 text-base-content/70">
              Browse every club already available in your dashboard now, then drill into form,
              fixtures, and trend views in the next pass.
            </p>
          </div>

          <div className="w-full max-w-md">
            <label className="space-y-2">
              <span className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                Search clubs
              </span>
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by club name"
                className="input input-bordered h-11 w-full rounded-2xl border-base-content/12 bg-base-100/60"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="badge badge-soft rounded-full border-none bg-primary/14 px-3 text-primary">
            {teams.length} clubs available
          </span>
          {normalizedSearch ? (
            <span className="badge badge-outline rounded-full border-base-content/12 text-base-content/72">
              {filteredTeams.length} matching &quot;{deferredSearch.trim()}&quot;
            </span>
          ) : null}
        </div>
      </section>

      {loadState === "loading" ? <TeamGridSkeleton /> : null}

      {loadState === "error" ? (
        <div className="space-y-4">
          <StatusAlert
            variant="error"
            title="We couldn't load the teams list"
            description={errorMessage ?? "Please try again."}
          />
          <button
            type="button"
            className="btn btn-primary rounded-full px-6"
            onClick={() => {
              setLoadState("loading");
              setErrorMessage(null);
              setTeams([]);
              setSearchValue("");
              void getTeams()
                .then((response) => {
                  setTeams(response);
                  setLoadState("ready");
                })
                .catch((error) => {
                  setErrorMessage(getErrorCopy(error));
                  setLoadState("error");
                });
            }}
          >
            Try again
          </button>
        </div>
      ) : null}

      {loadState === "ready" && !teams.length ? (
        <EmptyState
          eyebrow="No clubs"
          title="No Premier League clubs are available yet"
          description="The teams route is connected, but the backend did not return any clubs."
        />
      ) : null}

      {loadState === "ready" && teams.length && !filteredTeams.length ? (
        <EmptyState
          eyebrow="No results"
          title="No clubs match your search"
          description="Try a different club name or clear the search to see the full league list."
        />
      ) : null}

      {loadState === "ready" && filteredTeams.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
