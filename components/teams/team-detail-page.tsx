"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatusAlert } from "@/components/ui/status-alert";
import { MatchCard } from "@/components/teams/match-card";
import { TeamCrest } from "@/components/teams/team-crest";
import { TrendSeriesCard } from "@/components/teams/trend-series-card";
import { isAppApiError } from "@/lib/api/errors";
import {
  getTeamFixtureDifficulty,
  getTeamForm,
  getTeamMatches,
  getTeams,
  getTeamSummary,
  getTeamTrends,
} from "@/lib/api/teams";
import {
  getCompactTeamLabel,
  getTeamAccentColor,
  getTeamMetaLine,
} from "@/lib/teams/presentation";
import type {
  FixtureDifficultyResponse,
  MatchType,
  TeamFormResponse,
  TeamListItem,
  TeamMatchesResponse,
  TeamSummaryResponse,
  TeamTrendsResponse,
} from "@/types/teams";

type DetailTab = "overview" | "matches" | "form" | "trends" | "difficulty";
type LoadStatus = "idle" | "loading" | "ready" | "error";

type ResourceState<T> = {
  status: LoadStatus;
  data: T | null;
  error: string | null;
};

function createIdleState<T>(): ResourceState<T> {
  return {
    status: "idle",
    data: null,
    error: null,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (isAppApiError(error)) {
    if (error.status === 429) {
      return "That analytics endpoint is being rate limited right now. Please wait a moment and try again.";
    }

    return error.message;
  }

  return fallback;
}

function getPointsFromResults(results: TeamSummaryResponse["lastResults"]) {
  return results.reduce((total, match) => {
    if (match.perspective.result === "W") return total + 3;
    if (match.perspective.result === "D") return total + 1;
    return total;
  }, 0);
}

function getDifficultyTone(label: FixtureDifficultyResponse["run"]["label"]) {
  if (label === "Easy") return "bg-primary/14 text-primary";
  if (label === "Hard") return "bg-error/14 text-error";
  return "bg-warning/14 text-warning";
}

function TeamDetailLoading() {
  return (
    <div className="w-full max-w-6xl space-y-5">
      <LoadingSkeleton className="h-52 rounded-[1.8rem]" />
      <LoadingSkeleton className="h-12 rounded-[1.4rem]" />
      <LoadingSkeleton className="h-72 rounded-[1.8rem]" />
    </div>
  );
}

export function TeamDetailPage({ teamId }: { teamId: number }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [matchesType, setMatchesType] = useState<MatchType>("all");
  const [formMatches, setFormMatches] = useState(10);
  const [fixturesCount, setFixturesCount] = useState(5);
  const [summaryState, setSummaryState] = useState<ResourceState<TeamSummaryResponse>>({
    status: "loading",
    data: null,
    error: null,
  });
  const [matchesState, setMatchesState] = useState<ResourceState<TeamMatchesResponse>>(createIdleState);
  const [formState, setFormState] = useState<ResourceState<TeamFormResponse>>(createIdleState);
  const [trendsState, setTrendsState] = useState<ResourceState<TeamTrendsResponse>>(createIdleState);
  const [difficultyState, setDifficultyState] =
    useState<ResourceState<FixtureDifficultyResponse>>(createIdleState);
  const [directoryTeam, setDirectoryTeam] = useState<TeamListItem | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadSummary() {
      setSummaryState({
        status: "loading",
        data: null,
        error: null,
      });

      try {
        const [summary, teamsDirectory] = await Promise.all([
          getTeamSummary(teamId),
          getTeams().catch(() => null),
        ]);

        if (!isActive) {
          return;
        }

        setSummaryState({
          status: "ready",
          data: summary,
          error: null,
        });
        setDirectoryTeam(
          teamsDirectory?.find((team) => team.id === teamId) ?? null
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        setSummaryState({
          status: "error",
          data: null,
          error: getErrorMessage(error, "We couldn't load this club overview."),
        });
      }
    }

    void loadSummary();

    return () => {
      isActive = false;
    };
  }, [teamId]);

  useEffect(() => {
    if (activeTab !== "matches") {
      return;
    }

    let isActive = true;

    async function loadMatches() {
      setMatchesState({
        status: "loading",
        data: null,
        error: null,
      });

      try {
        const response = await getTeamMatches(teamId, matchesType, 12);
        if (!isActive) {
          return;
        }

        setMatchesState({
          status: "ready",
          data: response,
          error: null,
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setMatchesState({
          status: "error",
          data: null,
          error: getErrorMessage(error, "We couldn't load the match list."),
        });
      }
    }

    void loadMatches();

    return () => {
      isActive = false;
    };
  }, [activeTab, matchesType, teamId]);

  useEffect(() => {
    if (activeTab !== "form") {
      return;
    }

    let isActive = true;

    async function loadForm() {
      setFormState({
        status: "loading",
        data: null,
        error: null,
      });

      try {
        const response = await getTeamForm(teamId, formMatches);
        if (!isActive) {
          return;
        }

        setFormState({
          status: "ready",
          data: response,
          error: null,
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setFormState({
          status: "error",
          data: null,
          error: getErrorMessage(error, "We couldn't load the form snapshot."),
        });
      }
    }

    void loadForm();

    return () => {
      isActive = false;
    };
  }, [activeTab, formMatches, teamId]);

  useEffect(() => {
    if (activeTab !== "trends") {
      return;
    }

    let isActive = true;

    async function loadTrends() {
      setTrendsState({
        status: "loading",
        data: null,
        error: null,
      });

      try {
        const response = await getTeamTrends(teamId);
        if (!isActive) {
          return;
        }

        setTrendsState({
          status: "ready",
          data: response,
          error: null,
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setTrendsState({
          status: "error",
          data: null,
          error: getErrorMessage(error, "We couldn't load the trends view."),
        });
      }
    }

    void loadTrends();

    return () => {
      isActive = false;
    };
  }, [activeTab, teamId]);

  useEffect(() => {
    if (activeTab !== "difficulty") {
      return;
    }

    let isActive = true;

    async function loadDifficulty() {
      setDifficultyState({
        status: "loading",
        data: null,
        error: null,
      });

      try {
        const response = await getTeamFixtureDifficulty(teamId, fixturesCount);
        if (!isActive) {
          return;
        }

        setDifficultyState({
          status: "ready",
          data: response,
          error: null,
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setDifficultyState({
          status: "error",
          data: null,
          error: getErrorMessage(error, "We couldn't load fixture difficulty."),
        });
      }
    }

    void loadDifficulty();

    return () => {
      isActive = false;
    };
  }, [activeTab, fixturesCount, teamId]);

  const displayTeam = useMemo(() => {
    if (!summaryState.data) {
      return null;
    }

    return {
      ...summaryState.data.team,
      symbolicName: directoryTeam?.symbolicName ?? null,
      logoUrl: directoryTeam?.logoUrl ?? null,
    };
  }, [directoryTeam, summaryState.data]);

  if (summaryState.status === "loading") {
    return <TeamDetailLoading />;
  }

  if (summaryState.status === "error" && !summaryState.data) {
    return (
      <div className="w-full max-w-3xl space-y-4">
        <StatusAlert
          variant="error"
          title="We couldn't load this club"
          description={summaryState.error ?? "Please try again."}
        />
        <Link href="/teams" className="btn btn-primary rounded-full px-6">
          Back to clubs
        </Link>
      </div>
    );
  }

  if (!summaryState.data || !displayTeam) {
    return (
      <div className="w-full max-w-3xl">
        <EmptyState
          eyebrow="Club not found"
          title="This team is not available"
          description="The requested team could not be found in the current Premier League list."
        />
      </div>
    );
  }

  const accent = getTeamAccentColor(displayTeam);
  const summary = summaryState.data;
  const overviewPoints = getPointsFromResults(summary.lastResults);

  return (
    <div className="w-full max-w-6xl space-y-5">
      <Link href="/teams" className="btn btn-ghost w-fit rounded-full border border-base-content/10 px-5">
        Back to clubs
      </Link>

      <section className="glass-panel rounded-[1.9rem] p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-center gap-4">
            <TeamCrest team={displayTeam} accent={accent} />

            <div>
              <p className="section-kicker">Team analytics</p>
              <h1 className="mt-3 text-[2.1rem] font-semibold tracking-[-0.03em] text-base-content">
                {displayTeam.name}
              </h1>
              <p className="mt-2 text-sm leading-6 text-base-content/72">
                {getTeamMetaLine(displayTeam)}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.05] p-4">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                Recent points
              </p>
              <p className="mt-2 text-2xl font-semibold text-base-content">{overviewPoints}</p>
              <p className="mt-2 text-sm text-base-content/68">From the last 3 completed matches</p>
            </div>

            <div className="rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.05] p-4">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                Upcoming
              </p>
              <p className="mt-2 text-2xl font-semibold text-base-content">
                {summary.nextFixtures.length}
              </p>
              <p className="mt-2 text-sm text-base-content/68">Fixtures already queued in the summary</p>
            </div>

            <div className="rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.05] p-4">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                Club label
              </p>
              <p className="mt-2 text-2xl font-semibold text-base-content">
                {getCompactTeamLabel(displayTeam)}
              </p>
              <p className="mt-2 text-sm text-base-content/68">Compact club reference for cards and stats</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          ["overview", "Overview"],
          ["matches", "Matches"],
          ["form", "Form"],
          ["trends", "Trends"],
          ["difficulty", "Fixture difficulty"],
        ].map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-primary text-primary-content"
                : "border border-base-content/10 bg-base-content/[0.04] text-base-content/72"
            }`}
            onClick={() => setActiveTab(tab as DetailTab)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-5 xl:grid-cols-2">
          <section className="surface-card rounded-[1.7rem] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Recent form</p>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-base-content">
                  Last completed matches
                </h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {summary.lastResults.length ? (
                summary.lastResults.map((match) => (
                  <MatchCard key={match.id} match={match} showResult />
                ))
              ) : (
                <EmptyState
                  eyebrow="No results"
                  title="No completed matches yet"
                  description="Once finished matches are available, they will appear here."
                />
              )}
            </div>
          </section>

          <section className="surface-card rounded-[1.7rem] p-5 sm:p-6">
            <p className="section-kicker">Ahead</p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-base-content">
              Next fixtures
            </h2>
            <div className="mt-5 space-y-3">
              {summary.nextFixtures.length ? (
                summary.nextFixtures.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))
              ) : (
                <EmptyState
                  eyebrow="No fixtures"
                  title="No upcoming fixtures right now"
                  description="Once upcoming matches are available, they will appear here."
                />
              )}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "matches" ? (
        <section className="surface-card rounded-[1.7rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Match list</p>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-base-content">
                Full match history and fixtures
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "results", "fixtures"] as MatchType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    matchesType === type
                      ? "bg-primary text-primary-content"
                      : "border border-base-content/10 bg-base-content/[0.04] text-base-content/72"
                  }`}
                  onClick={() => setMatchesType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            {matchesState.status === "loading" ? <TeamDetailLoading /> : null}
            {matchesState.status === "error" ? (
              <StatusAlert
                variant="error"
                title="We couldn't load the match list"
                description={matchesState.error ?? "Please try again."}
              />
            ) : null}
            {matchesState.status === "ready" && matchesState.data ? (
              <div className="space-y-3">
                {matchesState.data.matches.map((match) => (
                  <MatchCard key={match.id} match={match} showResult={match.ended} />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {activeTab === "form" ? (
        <section className="surface-card rounded-[1.7rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Form snapshot</p>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-base-content">
                Explainable recent form
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 20].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    formMatches === option
                      ? "bg-primary text-primary-content"
                      : "border border-base-content/10 bg-base-content/[0.04] text-base-content/72"
                  }`}
                  onClick={() => setFormMatches(option)}
                >
                  Last {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            {formState.status === "loading" ? <TeamDetailLoading /> : null}
            {formState.status === "error" ? (
              <StatusAlert
                variant="error"
                title="We couldn't load form analytics"
                description={formState.error ?? "Please try again."}
              />
            ) : null}
            {formState.status === "ready" && formState.data ? (
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Points", formState.data.points],
                    ["PPG", formState.data.ppg],
                    ["Goal diff", formState.data.gd],
                    ["Clean sheets", formState.data.cleanSheets],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.04] p-4">
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-base-content">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
                  <div className="rounded-[1.5rem] border border-base-content/10 bg-base-content/[0.04] p-5">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                      Recent sequence
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {formState.data.form.map((result, index) => (
                        <span
                          key={`${result}-${index}`}
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            result === "W"
                              ? "bg-primary/14 text-primary"
                              : result === "L"
                              ? "bg-error/14 text-error"
                              : "bg-base-content/[0.08] text-base-content/78"
                          }`}
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-base-content/10 bg-base-content/[0.04] p-5">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                      Rating
                    </p>
                    <p className="mt-3 text-lg font-semibold text-base-content">
                      {formState.data.formRating?.rating ?? "Not enough data"}
                    </p>
                    {formState.data.formRating ? (
                      <div className="mt-3 space-y-2 text-sm leading-6 text-base-content/72">
                        <p>Recent PPG: {formState.data.formRating.recentPPG}</p>
                        <p>Baseline PPG: {formState.data.formRating.baselinePPG}</p>
                        <p>{formState.data.formRating.confirmation}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {activeTab === "trends" ? (
        <section className="surface-card rounded-[1.7rem] p-5 sm:p-6">
          <p className="section-kicker">Trend lines</p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-base-content">
            Rolling performance windows
          </h2>

          <div className="mt-5">
            {trendsState.status === "loading" ? <TeamDetailLoading /> : null}
            {trendsState.status === "error" ? (
              <StatusAlert
                variant="error"
                title="We couldn't load trend analytics"
                description={trendsState.error ?? "Please try again."}
              />
            ) : null}
            {trendsState.status === "ready" && trendsState.data ? (
              trendsState.data.labels.length ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  <TrendSeriesCard
                    title="Points per game"
                    subtitle="Rolling PPG across the recent match window."
                    values={trendsState.data.ppgSeries}
                    labels={trendsState.data.labels}
                  />
                  <TrendSeriesCard
                    title="Goal diff per match"
                    subtitle="How goal difference is moving over time."
                    values={trendsState.data.gdPerMatchSeries}
                    labels={trendsState.data.labels}
                  />
                  <TrendSeriesCard
                    title="Goals for"
                    subtitle="Rolling attacking output by window."
                    values={trendsState.data.gfPerMatchSeries}
                    labels={trendsState.data.labels}
                  />
                  <TrendSeriesCard
                    title="Goals against"
                    subtitle="Rolling defensive record by window."
                    values={trendsState.data.gaPerMatchSeries}
                    labels={trendsState.data.labels}
                  />
                </div>
              ) : (
                <EmptyState
                  eyebrow="Not enough matches"
                  title="Trend windows need more completed matches"
                  description="Once enough ended matches are available for the rolling window, the trend charts will appear here."
                />
              )
            ) : null}
          </div>
        </section>
      ) : null}

      {activeTab === "difficulty" ? (
        <section className="surface-card rounded-[1.7rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Fixture difficulty</p>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-base-content">
                Upcoming run strength
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[3, 5].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    fixturesCount === option
                      ? "bg-primary text-primary-content"
                      : "border border-base-content/10 bg-base-content/[0.04] text-base-content/72"
                  }`}
                  onClick={() => setFixturesCount(option)}
                >
                  Next {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            {difficultyState.status === "loading" ? <TeamDetailLoading /> : null}
            {difficultyState.status === "error" ? (
              <StatusAlert
                variant="error"
                title="We couldn't load fixture difficulty"
                description={difficultyState.error ?? "Please try again."}
              />
            ) : null}
            {difficultyState.status === "ready" && difficultyState.data ? (
              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-base-content/10 bg-base-content/[0.04] p-5">
                  <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                    Overall run
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getDifficultyTone(difficultyState.data.run.label)}`}>
                      {difficultyState.data.run.label}
                    </span>
                    <span className="text-sm text-base-content/72">
                      Score {difficultyState.data.run.difficultyScore} across{" "}
                      {difficultyState.data.run.countedFixtures} fixtures
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {difficultyState.data.items.map((item) => (
                    <article
                      key={item.match.id}
                      className="rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.04] p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                            {item.match.homeAway === "H" ? "Home fixture" : "Away fixture"}
                          </p>
                          <p className="mt-2 text-base font-semibold text-base-content">
                            {item.opponent?.shortName || item.opponent?.name || "Opponent"}
                          </p>
                          <p className="mt-2 text-sm text-base-content/70">{item.match.startTime}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getDifficultyTone(item.fixtureLabel)}`}>
                            {item.fixtureLabel}
                          </span>
                          <span className="text-sm font-medium text-base-content">
                            {item.fixtureDifficulty}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
