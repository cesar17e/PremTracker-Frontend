"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ModelDetails } from "@/components/ui/model-details";
import { StatusAlert } from "@/components/ui/status-alert";
import { MatchCard } from "@/components/teams/match-card";
import { FavoriteButton } from "@/components/teams/favorite-button";
import { TeamCrest } from "@/components/teams/team-crest";
import {
  getTrendStatusFromSeries,
  TrendSeriesCard,
} from "@/components/teams/trend-series-card";
import { formatDateTime } from "@/lib/format/dates";
import { isAppApiError } from "@/lib/api/errors";
import { useFavorites } from "@/hooks/use-favorites";
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
const MATCHES_PAGE_SIZE = 12;
type FormRating = NonNullable<TeamFormResponse["formRating"]>;
type DifficultyItem = FixtureDifficultyResponse["items"][number];
type DifficultyParams = FixtureDifficultyResponse["params"];

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

function getMatchesFilterDescription(type: MatchType) {
  if (type === "results") {
    return "Showing completed matches only.";
  }

  if (type === "fixtures") {
    return "Showing upcoming fixtures only.";
  }

  return "Showing completed matches and upcoming fixtures.";
}

function getMatchesEmptyState(type: MatchType) {
  if (type === "results") {
    return {
      eyebrow: "No results",
      title: "No completed matches available",
      description: "Completed matches for this club will appear here as soon as they are in the database.",
    };
  }

  if (type === "fixtures") {
    return {
      eyebrow: "No fixtures",
      title: "No upcoming fixtures available",
      description: "Scheduled fixtures for this club will appear here as soon as they are in the database.",
    };
  }

  return {
    eyebrow: "No matches",
    title: "No matches or fixtures available",
    description: "Once completed matches or upcoming fixtures are available, they will appear here.",
  };
}

function formatSignedMetric(value: number, digits = 2) {
  if (value > 0) {
    return `+${value.toFixed(digits)}`;
  }

  return value.toFixed(digits);
}

function getFormRatingTone(rating: FormRating["rating"]) {
  if (rating === "Strong form" || rating === "Good form") {
    return "bg-primary/14 text-primary";
  }

  if (rating === "Poor form" || rating === "Bad form") {
    return "bg-error/14 text-error";
  }

  return "bg-base-content/[0.08] text-base-content/78";
}

function getDeltaExplanation(deltaPPG: number) {
  if (deltaPPG >= 0.15) {
    return "Recent points per game are running above the longer baseline, so current form is trending upward.";
  }

  if (deltaPPG <= -0.15) {
    return "Recent points per game are below the longer baseline, so current form is trending down.";
  }

  return "Recent points per game are close to the longer baseline, so form is tracking near its usual level.";
}

function getVolatilityExplanation(label: FormRating["volatility"]["label"]) {
  if (label === "Stable") {
    return "Recent match points have been consistent, so the current run looks steady rather than streaky.";
  }

  if (label === "High volatility") {
    return "Recent match points have swung sharply, so the current run is more streaky and less predictable.";
  }

  return "Recent match points are moving around, but not wildly enough to call the run completely streaky.";
}

function getConfirmationExplanation(confirmation: FormRating["confirmation"]) {
  if (confirmation === "Performance-backed") {
    return "The points trend is supported by goal difference, which makes the rating more convincing.";
  }

  if (confirmation === "Results > performance") {
    return "Points improved, but goal difference did not improve with them, so the run may be less sustainable.";
  }

  if (confirmation === "Consistently struggling") {
    return "Both points and goal difference are moving the wrong way, which confirms the downturn.";
  }

  return "Points and goal difference are sending mixed signals, so the rating should be read with some caution.";
}

function getOverallTrendsTakeaway(trends: TeamTrendsResponse) {
  const statuses = [
    getTrendStatusFromSeries(trends.ppgSeries, "up"),
    getTrendStatusFromSeries(trends.gdPerMatchSeries, "up"),
    getTrendStatusFromSeries(trends.gfPerMatchSeries, "up"),
    getTrendStatusFromSeries(trends.gaPerMatchSeries, "down"),
  ];

  const improving = statuses.filter((status) => status === "improving").length;
  const declining = statuses.filter((status) => status === "declining").length;

  if (improving >= 3) {
    return {
      label: "Broadly improving",
      description:
        "Most visible rolling metrics are moving in the right direction, so the latest form looks supported by a broader upward trend.",
    };
  }

  if (declining >= 3) {
    return {
      label: "Broadly declining",
      description:
        "Most visible rolling metrics are slipping, so the latest form looks part of a broader downward pattern rather than a one-off dip.",
    };
  }

  return {
    label: "Mixed trend picture",
    description:
      "Some rolling metrics are improving while others are fading, so the broader direction is less clear and the recent form may still be noisy.",
  };
}

function getOverallTrendTone(label: string) {
  if (label === "Broadly improving") {
    return "bg-primary/12 text-primary";
  }

  if (label === "Broadly declining") {
    return "bg-error/12 text-error";
  }

  return "bg-base-content/[0.08] text-base-content/78";
}

function getFormRangeDescription(range: number) {
  if (range === 5) {
    return "Last 5 zooms in on the latest completed matches, so the view is mostly raw recent form with very little older context.";
  }

  if (range === 10) {
    return "Last 10 compares the latest 5 completed matches against the previous 5, giving a recent-past benchmark.";
  }

  return "Last 20 still defines current form as the latest 5 completed matches, but compares them against a broader older baseline.";
}

function getAlphaGuidance(alpha: number) {
  if (alpha <= 0.2) {
    return "This setting leans heavily on longer-term opponent strength and only lightly reacts to recent momentum.";
  }

  if (alpha >= 0.7) {
    return "This setting reacts strongly to recent momentum, so short-term swings will move the model more aggressively.";
  }

  return "This balances longer-term strength with recent momentum, so current form matters without fully overriding the bigger sample.";
}

function getDifficultyRunTakeaway(label: FixtureDifficultyResponse["run"]["label"], fixtures: number) {
  if (label === "Easy") {
    return `Easy run: the next ${fixtures} fixture${fixtures === 1 ? "" : "s"} look softer overall, with the schedule tilting toward more manageable matchups.`;
  }

  if (label === "Hard") {
    return `Hard run: the next ${fixtures} fixture${fixtures === 1 ? "" : "s"} look demanding overall, with stronger or more in-form opponents raising the difficulty.`;
  }

  return `Medium run: the next ${fixtures} fixture${fixtures === 1 ? "" : "s"} look moderately difficult overall, with a mix of tougher and more manageable tests.`;
}

function getMomentumAdjustment(deltaPPG: number, alpha: number) {
  return Number((alpha * deltaPPG).toFixed(2));
}

function getVenueAdjustmentText(homeAway: DifficultyItem["match"]["homeAway"], params: DifficultyParams) {
  if (!params.homeAway.enabled) {
    return "Venue adjustment is turned off for this model run.";
  }

  if (homeAway === "H") {
    return `Home venue slightly softens the score with a ${params.homeAway.homeFactor.toFixed(2)} factor.`;
  }

  return `Away venue slightly increases the score with a ${params.homeAway.awayFactor.toFixed(2)} factor.`;
}

function getFixtureMomentumText(item: DifficultyItem, params: DifficultyParams) {
  const adjustment = getMomentumAdjustment(item.opponentMetrics.deltaPPG, params.alpha);

  if (Math.abs(adjustment) < 0.05) {
    return "Recent momentum is barely moving this score, so the opponent's longer-term level is doing most of the work.";
  }

  if (adjustment > 0) {
    return "Recent momentum is pushing this fixture harder than the opponent's baseline strength alone would suggest.";
  }

  return "Recent momentum is softening this fixture relative to the opponent's longer-term baseline strength.";
}

function getFixtureQuickTakeaway(item: DifficultyItem, params: DifficultyParams) {
  const adjustment = getMomentumAdjustment(item.opponentMetrics.deltaPPG, params.alpha);

  const momentumMessage =
    Math.abs(adjustment) < 0.05
      ? "This score is being driven mostly by the opponent's baseline level."
      : adjustment > 0
      ? "Recent momentum is making this opponent tougher than their baseline alone would suggest."
      : "Recent momentum is softening this matchup relative to the opponent's baseline.";

  const venueMessage = params.homeAway.enabled
    ? item.match.homeAway === "H"
      ? "Home venue eases it slightly."
      : "Away venue adds a small difficulty bump."
    : "Venue is neutral in this model run.";

  return `${momentumMessage} ${venueMessage}`;
}

function FormDetailRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-base-content/10 bg-base-content/[0.03] px-4 py-3">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-base-content">{value}</p>
      {detail ? <p className="mt-1 text-sm leading-6 text-base-content/64">{detail}</p> : null}
    </div>
  );
}

function ModelFormulaRow({
  label,
  formula,
  detail,
}: {
  label: string;
  formula: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-base-content/10 bg-base-content/[0.03] px-4 py-3">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
        {label}
      </p>
      <p className="mt-2 font-mono text-sm text-base-content">{formula}</p>
      <p className="mt-2 text-sm leading-6 text-base-content/64">{detail}</p>
    </div>
  );
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
  const { errorMessage: favoritesError } = useFavorites();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [matchesType, setMatchesType] = useState<MatchType>("all");
  const [matchesLimit, setMatchesLimit] = useState(MATCHES_PAGE_SIZE);
  const [formMatches, setFormMatches] = useState(10);
  const [fixturesCount, setFixturesCount] = useState(5);
  const [difficultyAlpha, setDifficultyAlpha] = useState(0.4);
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
  const deferredDifficultyAlpha = useDeferredValue(difficultyAlpha);

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
        const response = await getTeamMatches(teamId, matchesType, matchesLimit);
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
  }, [activeTab, matchesLimit, matchesType, teamId]);

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
        const response = await getTeamFixtureDifficulty(teamId, {
          fixtures: fixturesCount,
          alpha: deferredDifficultyAlpha,
        });
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
  }, [activeTab, deferredDifficultyAlpha, fixturesCount, teamId]);

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
  const trendsTakeaway = trendsState.data ? getOverallTrendsTakeaway(trendsState.data) : null;
  const difficultyTakeaway = difficultyState.data
    ? getDifficultyRunTakeaway(
        difficultyState.data.run.label,
        difficultyState.data.items.length
      )
    : null;

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
              <div className="mt-4">
                <FavoriteButton
                  team={{
                    id: displayTeam.id,
                    externalTeamId: displayTeam.externalTeamId,
                    name: displayTeam.name,
                    shortName: displayTeam.shortName,
                    symbolicName: displayTeam.symbolicName,
                    logoUrl: displayTeam.logoUrl,
                    color: displayTeam.color,
                    awayColor: displayTeam.awayColor,
                    imageVersion: displayTeam.imageVersion,
                  }}
                />
              </div>
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

      {favoritesError ? (
        <StatusAlert
          variant="warning"
          title="Favorites are temporarily unavailable"
          description={favoritesError}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {[
          ["overview", "Overview"],
          ["matches", "Matches"],
          ["form", "Form"],
          ["trends", "Trends"],
          ["difficulty", "Upcoming Fixture Difficulty"],
        ].map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
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
                Recent matches and fixtures
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "results", "fixtures"] as MatchType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium ${
                    matchesType === type
                      ? "bg-primary text-primary-content"
                      : "border border-base-content/10 bg-base-content/[0.04] text-base-content/72"
                  }`}
                  onClick={() => {
                    setMatchesType(type);
                    setMatchesLimit(MATCHES_PAGE_SIZE);
                  }}
                >
                  {type === "all"
                    ? "All"
                    : type === "results"
                    ? "Past results"
                    : "Upcoming fixtures"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-sm leading-6 text-base-content/70">
              {getMatchesFilterDescription(matchesType)}
            </p>
            <p className="text-sm leading-6 text-base-content/58">
              Starting with {matchesLimit} items for this filter. Use Load more to expand the
              visible list.
            </p>
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
              <div className="space-y-5">
                {matchesState.data.matches.length ? (
                  <div className="space-y-3">
                    {matchesState.data.matches.map((match) => (
                      <MatchCard key={match.id} match={match} showResult={match.ended} />
                    ))}
                  </div>
                ) : (
                  <EmptyState {...getMatchesEmptyState(matchesType)} />
                )}

                {matchesState.data.matches.length >= matchesLimit ? (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className="btn btn-ghost cursor-pointer rounded-full border border-base-content/10 px-6"
                      onClick={() => setMatchesLimit((current) => current + MATCHES_PAGE_SIZE)}
                    >
                      Load more
                    </button>
                  </div>
                ) : null}
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
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium ${
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

          <div className="mt-3 rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.04] px-4 py-3">
            <p className="text-sm leading-6 text-base-content/72">
              Current form is always based on the latest 5 completed matches, or fewer if the club
              does not have 5 yet. The selected range changes how much older context is available
              for comparison.
            </p>
            <p className="mt-2 text-sm leading-6 text-base-content/64">
              {getFormRangeDescription(formMatches)}
            </p>
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
                <ModelDetails
                  title="Form model details"
                  description="Optional deeper view of how the selected sample, current 5-match window, and comparison baseline produce the form output."
                >
                  <div className="space-y-5">
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.03] p-4">
                        <p className="text-sm font-semibold text-base-content">Selected sample</p>
                        <p className="mt-2 text-sm leading-6 text-base-content/68">
                          The top stat cards and the visible W/D/L sequence use the selected recent
                          sample, which is currently the last {formMatches} completed matches or
                          fewer if the club does not have that many.
                        </p>
                      </div>

                      <div className="rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.03] p-4">
                        <p className="text-sm font-semibold text-base-content">Current form window</p>
                        <p className="mt-2 text-sm leading-6 text-base-content/68">
                          The rating model always defines current form as the latest 5 completed
                          matches, or fewer when the club does not have 5 yet. Last 10 and Last 20
                          only widen the older context used for comparison.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <ModelFormulaRow
                        label="Points"
                        formula="3 x wins + 1 x draws"
                        detail="Total points across the selected sample. Losses contribute zero points."
                      />
                      <ModelFormulaRow
                        label="PPG"
                        formula="total points / matches"
                        detail="Points per game across the selected sample."
                      />
                      <ModelFormulaRow
                        label="Goal difference"
                        formula="goals for - goals against"
                        detail="Net scoring margin across the selected sample."
                      />
                      <ModelFormulaRow
                        label="Clean sheets"
                        formula="matches with 0 goals conceded"
                        detail="Counts how many matches in the selected sample ended with no goals allowed."
                      />
                      <ModelFormulaRow
                        label="deltaPPG"
                        formula="recentPPG - baselinePPG"
                        detail="Measures whether the latest 5-match form is outperforming or underperforming the older baseline."
                      />
                      <ModelFormulaRow
                        label="Volatility"
                        formula="variation of recent match points (0, 1, 3)"
                        detail="Summarizes whether the latest 5-match run is steady or streaky."
                      />
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.03] p-4">
                        <p className="text-sm font-semibold text-base-content">Window comparison</p>
                        <p className="mt-2 font-mono text-sm text-base-content">
                          recent window = latest 5 completed matches
                        </p>
                        <p className="mt-1 font-mono text-sm text-base-content">
                          baseline window = older matches from the selected sample
                        </p>
                        <p className="mt-2 text-sm leading-6 text-base-content/68">
                          Positive delta PPG means the current run is doing better than the older
                          baseline. Negative delta PPG means it is doing worse.
                        </p>
                      </div>

                      <div className="rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.03] p-4">
                        <p className="text-sm font-semibold text-base-content">Confirmation</p>
                        <p className="mt-2 font-mono text-sm text-base-content">
                          compare deltaPPG with delta goal difference per match
                        </p>
                        <p className="mt-2 text-sm leading-6 text-base-content/68">
                          This checks whether the points trend is also supported by goal-difference
                          trend, which helps separate sustainable improvement from noisier results.
                        </p>
                      </div>
                    </div>
                  </div>
                </ModelDetails>

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
                    <p className="mt-3 text-sm leading-6 text-base-content/68">
                      Newest to oldest results across the selected sample. The model still treats
                      the latest 5 completed matches as current form.
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
                      Model explanation
                    </p>
                    {formState.data.formRating ? (
                      <div className="mt-3 space-y-5">
                        <div className="rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.05] p-4 sm:p-5">
                          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                            Main result
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-base-content sm:text-[1.85rem]">
                              {formState.data.formRating.rating}
                            </h3>
                            <span
                              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${getFormRatingTone(
                                formState.data.formRating.rating
                              )}`}
                            >
                              Current form result
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-base-content/70">
                            This label comes from comparing the latest{" "}
                            {formState.data.formRating.recentMatches} completed matches against an
                            older baseline built from the rest of the selected sample.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-base-content">
                            Why this rating?
                          </h3>
                          <p className="text-sm leading-6 text-base-content/70">
                            Current form is always the latest{" "}
                            {formState.data.formRating.recentMatches} matches against a longer{" "}
                            {formState.data.formRating.baselineMatches}-match baseline drawn from
                            older matches in the selected sample. Last 10 and Last 20 do not change
                            the definition of current form. They only add more context for the
                            comparison.
                          </p>

                          <p className="text-sm leading-6 text-base-content/70">
                            {getDeltaExplanation(formState.data.formRating.deltaPPG)} Positive
                            delta PPG means the current 5-match run is outperforming the older
                            baseline. Negative delta PPG means it is underperforming that baseline.
                          </p>

                          <p className="text-sm leading-6 text-base-content/70">
                            Volatility tells you whether those recent results are stable or streaky,
                            while confirmation checks whether the points trend is supported by goal
                            difference.
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <FormDetailRow
                            label="Recent window"
                            value={`${formState.data.formRating.recentMatches} matches`}
                            detail="This is the fixed current-form window used by the model."
                          />
                          <FormDetailRow
                            label="Baseline window"
                            value={`${formState.data.formRating.baselineMatches} matches`}
                            detail="Older matches from the selected sample used to interpret the latest 5."
                          />
                          <FormDetailRow
                            label="Recent PPG"
                            value={formState.data.formRating.recentPPG.toFixed(2)}
                            detail="Points per game across the latest 5 completed matches."
                          />
                          <FormDetailRow
                            label="Baseline PPG"
                            value={formState.data.formRating.baselinePPG.toFixed(2)}
                            detail="Points per game across the older comparison window."
                          />
                          <FormDetailRow
                            label="Delta PPG"
                            value={formatSignedMetric(formState.data.formRating.deltaPPG)}
                            detail="Recent PPG minus baseline PPG. Positive is better than baseline."
                          />
                          <FormDetailRow
                            label="Goal diff trend"
                            value={`${formatSignedMetric(
                              formState.data.formRating.deltaGDPerMatch
                            )} per match`}
                            detail="Recent goal difference per match versus the older baseline."
                          />
                          <FormDetailRow
                            label="Volatility"
                            value={formState.data.formRating.volatility.label}
                            detail={getVolatilityExplanation(
                              formState.data.formRating.volatility.label
                            )}
                          />
                          <FormDetailRow
                            label="Confirmation"
                            value={formState.data.formRating.confirmation}
                            detail={getConfirmationExplanation(
                              formState.data.formRating.confirmation
                            )}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <h3 className="text-lg font-semibold text-base-content">
                          Why this rating?
                        </h3>
                        <p className="text-sm leading-6 text-base-content/70">
                          The model needs enough completed matches to compare the latest 5-match
                          window against older context. Once that data exists, this card will show
                          the exact inputs and reasoning behind the rating.
                        </p>
                      </div>
                    )}
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

          <div className="mt-3 rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.04] px-4 py-3">
            <p className="text-sm leading-6 text-base-content/72">
              Form shows the current snapshot. Trends show the broader direction of performance over time, so you can see whether the latest run is part of a bigger rise, decline, or stable pattern.
            </p>

            <p className="mt-2 text-sm leading-6 text-base-content/64">
              Each point comes from a rolling window of completed matches. The current window uses the most recent matches, and the trend compares it to the previous set of matches of the same size.
            </p>

            <p className="mt-2 text-sm leading-6 text-base-content/64">
              This helps smooth out one-off results and makes underlying momentum easier to read.
            </p>
            {trendsTakeaway ? (
              <div className="mt-4 rounded-[1.25rem] border border-base-content/10 bg-base-content/[0.05] p-4 sm:p-5">
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                  Trend verdict
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-[1.55rem] font-semibold tracking-[-0.03em] text-base-content">
                      {trendsTakeaway.label}
                    </h3>
                    <p className="text-sm leading-6 text-base-content/72">
                      {trendsTakeaway.description}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3.5 py-1.5 text-sm font-semibold ${getOverallTrendTone(
                      trendsTakeaway.label
                    )}`}
                  >
                    Overall signal
                  </span>
                </div>
              </div>
            ) : null}
          </div>

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
                <div className="space-y-5">
                  <ModelDetails
                    title="Trend model details"
                    description="Optional deeper view of how rolling windows, current values, and deltas are calculated in this trends view."
                  >
                    <div className="space-y-5">
                      <div className="grid gap-3 lg:grid-cols-2">
                        <div className="rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.03] p-4">
                          <p className="text-sm font-semibold text-base-content">Why Trends exists</p>
                          <p className="mt-2 text-sm leading-6 text-base-content/68">
                            Form is the current snapshot. Trends zoom out and show how performance
                            has been moving over time so you can judge whether the latest form is
                            part of a broader rise, decline, or steadier pattern.
                          </p>
                        </div>

                        <div className="rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.03] p-4">
                          <p className="text-sm font-semibold text-base-content">Rolling windows</p>
                          <p className="mt-2 text-sm leading-6 text-base-content/68">
                            This view uses rolling {trendsState.data.window}-match windows across
                            the last {trendsState.data.matches} completed matches. The latest window
                            is the most recent set of matches, and the previous window is the
                            immediately preceding set of the same size.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <ModelFormulaRow
                          label="PPG"
                          formula="total points / matches in window"
                          detail="Shows how efficiently the team is turning each rolling window into points."
                        />
                        <ModelFormulaRow
                          label="Goal diff per match"
                          formula="(goals for - goals against) / matches in window"
                          detail="Tracks whether scoring margins are improving or slipping over time."
                        />
                        <ModelFormulaRow
                          label="Goals for per match"
                          formula="goals for / matches in window"
                          detail="Measures rolling attacking output."
                        />
                        <ModelFormulaRow
                          label="Goals against per match"
                          formula="goals against / matches in window"
                          detail="Measures rolling defensive record. Lower values are better here."
                        />
                        <ModelFormulaRow
                          label="Trend delta"
                          formula="current window - previous window"
                          detail="Shows how much the latest rolling window moved relative to the one immediately before it."
                        />
                      </div>

                      <div className="rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.03] p-4">
                        <p className="text-sm font-semibold text-base-content">How to read the cards</p>
                        <p className="mt-2 text-sm leading-6 text-base-content/68">
                          The main value is the current rolling-window metric. The change value is
                          the delta versus the previous rolling window. Together they show both the
                          current level and the direction of movement.
                        </p>
                      </div>
                    </div>
                  </ModelDetails>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <TrendSeriesCard
                      title="Points per game"
                      subtitle="How efficiently the team is turning recent matches into points."
                      explanation="Use this to judge whether results efficiency is moving up, down, or holding steady across recent rolling windows."
                      currentLabel="Current PPG"
                      changeLabel="points per game"
                      takeaway={{
                        improving:
                          "The team is earning points more efficiently across recent rolling windows, which points to broader upward momentum.",
                        declining:
                          "The team is earning fewer points per game across recent rolling windows, which suggests the broader results trend is weakening.",
                        stable:
                          "Points per game are holding near recent levels, so results efficiency looks fairly steady rather than sharply changing.",
                      }}
                      values={trendsState.data.ppgSeries}
                      labels={trendsState.data.labels}
                    />
                    <TrendSeriesCard
                      title="Goal diff per match"
                      subtitle="Whether the team is winning margins or losing ground over time."
                      explanation="This shows if broader performance is backing up the results trend or if the team is being outplayed beneath the surface."
                      currentLabel="Current goal diff per match"
                      changeLabel="goal difference per match"
                      takeaway={{
                        improving:
                          "Match margins are improving across rolling windows, which usually means the underlying performances are getting stronger.",
                        declining:
                          "Match margins are getting worse across rolling windows, which suggests performances are slipping even beyond the headline results.",
                        stable:
                          "Goal-difference margins are staying close to recent levels, so the broader performance picture looks fairly steady.",
                      }}
                      values={trendsState.data.gdPerMatchSeries}
                      labels={trendsState.data.labels}
                    />
                    <TrendSeriesCard
                      title="Goals for"
                      subtitle="Whether attacking output is improving across recent windows."
                      explanation="Higher rolling goals-for values suggest the attack is creating and finishing chances more consistently over time."
                      currentLabel="Current goals for per match"
                      changeLabel="goals scored per match"
                      takeaway={{
                        improving:
                          "The attack is producing more goals across rolling windows, which points to stronger attacking momentum.",
                        declining:
                          "The attack is producing fewer goals across rolling windows, which suggests chance creation or finishing is cooling off.",
                        stable:
                          "Scoring output is holding near recent levels, so the attack looks steady rather than sharply improving or fading.",
                      }}
                      values={trendsState.data.gfPerMatchSeries}
                      labels={trendsState.data.labels}
                    />
                    <TrendSeriesCard
                      title="Goals against"
                      subtitle="Whether the defensive record is tightening up or slipping."
                      explanation="Lower rolling goals-against values are better here. This helps separate genuine defensive improvement from short-term noise."
                      currentLabel="Current goals against per match"
                      changeLabel="goals conceded per match"
                      takeaway={{
                        improving:
                          "The team is conceding less across rolling windows, which points to a tightening defensive record.",
                        declining:
                          "The team is conceding more across rolling windows, which suggests the defensive record is starting to slip.",
                        stable:
                          "Goals conceded are staying near recent levels, so the defensive trend looks relatively steady.",
                      }}
                      values={trendsState.data.gaPerMatchSeries}
                      labels={trendsState.data.labels}
                      betterDirection="down"
                    />
                  </div>
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
              <p className="section-kicker">Upcoming fixture difficulty</p>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-base-content">
                Upcoming run strength
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[3, 5].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium ${
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

          <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.9fr)]">
            <div className="rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.04] px-4 py-4">
              <p className="text-sm leading-6 text-base-content/72">
                This model estimates how difficult the upcoming fixtures are by combining two
                ideas:
              </p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-base-content/68">
                <p>- how strong each opponent usually is (long-term strength)</p>
                <p>- how they&apos;ve been performing recently (short-term momentum)</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-base-content/64">
                These are blended into a single difficulty score, then adjusted for home or away
                context.
              </p>
              <p className="mt-3 text-sm leading-6 text-base-content/64">
                Use the fixture count to control how many upcoming matches are included. Use alpha
                to control how much recent form influences the score.
              </p>
              <p className="mt-3 text-sm leading-6 text-base-content/64">
                Higher final scores mean tougher opponents overall, while lower scores suggest a more manageable run.
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.04] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                    Alpha tuning
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-base-content">
                    Momentum vs Stability
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-base-content/68">
                    Control how much recent form affects difficulty.
                  </p>
                </div>
                <span className="rounded-full bg-base-content/[0.08] px-3 py-1 text-sm font-semibold text-base-content">
                  {difficultyAlpha.toFixed(1)}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-base-content/68">
                Alpha controls how much weight is given to recent performance compared to long-term
                strength.
              </p>

              <div className="mt-3 space-y-2 text-sm leading-6 text-base-content/64">
                <p>- Lower alpha - trust long-term strength more (more stable, less reactive)</p>
                <p>- Higher alpha - react more to recent form (more sensitive to streaks)</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-base-content/68">
                If you believe recent form matters more, increase alpha. If you want a more stable,
                long-term view, decrease it.
              </p>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={difficultyAlpha}
                onChange={(event) => setDifficultyAlpha(Number(event.currentTarget.value))}
                className="range range-primary mt-4 range-sm"
                aria-label="Difficulty alpha"
              />

              <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-base-content/48">
                <span>Long-term strength</span>
                <span>Default 0.4</span>
                <span>Recent momentum</span>
              </div>

              <p className="mt-4 text-sm leading-6 text-base-content/72">
                {getAlphaGuidance(difficultyAlpha)}
              </p>
              <p className="mt-2 text-sm leading-6 text-base-content/64">
                Tip: Try increasing alpha if a team is on a strong or poor run and you want that to
                impact the difficulty more.
              </p>
              <p className="mt-2 text-sm leading-6 text-base-content/60">
                0.4 is a reasonable default because it gives recent form meaningful influence
                without letting short-term swings completely override the bigger sample.
              </p>
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
                <div className="rounded-[1.55rem] border border-base-content/10 bg-base-content/[0.04] p-5 sm:p-6">
                  <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                    Overall run result
                  </p>
                  <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-[1.95rem] font-semibold tracking-[-0.04em] text-base-content">
                          {difficultyState.data.run.label} run
                        </h3>
                        <span className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${getDifficultyTone(difficultyState.data.run.label)}`}>
                          Score {difficultyState.data.run.difficultyScore}
                        </span>
                      </div>
                      <p className="max-w-2xl text-sm leading-6 text-base-content/72">
                        {difficultyTakeaway}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-base-content/10 bg-base-content/[0.03] px-3 py-1 text-sm text-base-content/72">
                        {difficultyState.data.items.length} fixture
                        {difficultyState.data.items.length === 1 ? "" : "s"}
                      </span>
                      <span className="rounded-full border border-base-content/10 bg-base-content/[0.03] px-3 py-1 text-sm text-base-content/72">
                        Alpha {difficultyState.data.params.alpha.toFixed(1)}
                      </span>
                      <span className="rounded-full border border-base-content/10 bg-base-content/[0.03] px-3 py-1 text-sm text-base-content/72">
                        Venue {difficultyState.data.params.homeAway.enabled ? "on" : "off"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.03] px-4 py-3">
                    <p className="text-sm leading-6 text-base-content/72">
                      Showing {difficultyState.data.items.length} of{" "}
                      {difficultyState.data.params.fixtures} requested upcoming fixtures.
                    </p>
                    {difficultyState.data.items.length < difficultyState.data.params.fixtures ? (
                      <p className="mt-2 text-sm leading-6 text-base-content/64">
                        Only {difficultyState.data.items.length} future fixtures are currently
                        available in the backend data for this club.
                      </p>
                    ) : null}
                  </div>
                </div>

                {difficultyState.data.items.length ? (
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
                            <p className="mt-2 text-sm text-base-content/70">
                              {formatDateTime(item.match.startTime)}
                            </p>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/68">
                              {getFixtureQuickTakeaway(item, difficultyState.data!.params)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getDifficultyTone(item.fixtureLabel)}`}>
                              {item.fixtureLabel}
                            </span>
                            <span className="text-sm font-medium text-base-content">
                              Score {item.fixtureDifficulty}
                            </span>
                          </div>
                        </div>

                        <details className="group mt-4 rounded-[1.15rem] border border-base-content/10 bg-base-content/[0.03]">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 [&::-webkit-details-marker]:hidden">
                            <div>
                              <p className="text-sm font-semibold text-base-content">
                                View breakdown
                              </p>
                              <p className="mt-1 text-sm text-base-content/64">
                                See the baseline, momentum adjustment, venue effect, and modeled
                                score behind this fixture.
                              </p>
                            </div>
                            <span className="rounded-full border border-base-content/10 bg-base-content/[0.04] px-3 py-1 text-sm text-base-content/72">
                              Show model inputs
                            </span>
                          </summary>

                          <div className="border-t border-base-content/10 px-4 py-4">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <div className="rounded-[1.05rem] border border-base-content/10 bg-base-content/[0.03] px-3 py-3">
                                <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                                  Baseline strength
                                </p>
                                <p className="mt-2 text-base font-semibold text-base-content">
                                  {item.opponentMetrics.baselinePPG.toFixed(2)} PPG
                                </p>
                              </div>
                              <div className="rounded-[1.05rem] border border-base-content/10 bg-base-content/[0.03] px-3 py-3">
                                <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                                  Recent momentum
                                </p>
                                <p className="mt-2 text-base font-semibold text-base-content">
                                  {formatSignedMetric(item.opponentMetrics.deltaPPG)} PPG
                                </p>
                              </div>
                              <div className="rounded-[1.05rem] border border-base-content/10 bg-base-content/[0.03] px-3 py-3">
                                <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                                  Alpha adjustment
                                </p>
                                <p className="mt-2 text-base font-semibold text-base-content">
                                  {formatSignedMetric(
                                    getMomentumAdjustment(
                                      item.opponentMetrics.deltaPPG,
                                      difficultyState.data!.params.alpha
                                    )
                                  )}
                                </p>
                              </div>
                              <div className="rounded-[1.05rem] border border-base-content/10 bg-base-content/[0.03] px-3 py-3">
                                <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                                  Modeled strength
                                </p>
                                <p className="mt-2 text-base font-semibold text-base-content">
                                  {item.opponentMetrics.oppStrength.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                              <div className="rounded-[1.05rem] border border-base-content/10 bg-base-content/[0.03] px-4 py-3">
                                <p className="text-sm font-semibold text-base-content">
                                  Momentum effect
                                </p>
                                <p className="mt-2 text-sm leading-6 text-base-content/68">
                                  {getFixtureMomentumText(item, difficultyState.data!.params)}
                                </p>
                              </div>
                              <div className="rounded-[1.05rem] border border-base-content/10 bg-base-content/[0.03] px-4 py-3">
                                <p className="text-sm font-semibold text-base-content">
                                  Venue effect
                                </p>
                                <p className="mt-2 text-sm leading-6 text-base-content/68">
                                  {getVenueAdjustmentText(
                                    item.match.homeAway,
                                    difficultyState.data!.params
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </details>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    eyebrow="No fixtures"
                    title="No upcoming fixtures available"
                    description="This club does not currently have future fixtures in the backend data for the selected difficulty view."
                  />
                )}

                <ModelDetails
                  title="Fixture difficulty model details"
                  description="Optional deeper view of how opponent quality, momentum, alpha, and venue combine inside the difficulty model."
                >
                  <div className="space-y-5">
                    <div className="rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.03] p-4">
                      <p className="text-sm font-semibold text-base-content">Core formula</p>
                      <p className="mt-2 font-mono text-sm text-base-content">
                        opponentStrength = baselinePPG + alpha * (recentPPG - baselinePPG)
                      </p>
                      <p className="mt-2 text-sm leading-6 text-base-content/68">
                        Start with longer-term opponent quality, adjust it for recent momentum, then
                        apply the home or away venue factor to reach the final fixture difficulty.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-base-content">Key concepts</p>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <ModelFormulaRow
                          label="baselinePPG"
                          formula="longer-term points per game"
                          detail="Represents the opponent's steadier underlying level across the larger sample."
                        />
                        <ModelFormulaRow
                          label="recentPPG"
                          formula="short-term points per game"
                          detail="Captures the opponent's recent momentum over the smaller recent sample."
                        />
                        <ModelFormulaRow
                          label="alpha"
                          formula="momentum weight in [0, 1]"
                          detail="Controls how strongly recent form can shift the opponent's baseline strength."
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-base-content">Advanced notes</p>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <ModelFormulaRow
                          label="momentum adjustment"
                          formula="alpha x (recentPPG - baselinePPG)"
                          detail="This is the amount recent form adds to or subtracts from the baseline."
                        />
                        <ModelFormulaRow
                          label="venue adjustment"
                          formula="opponentStrength x venueFactor"
                          detail="Home fixtures are slightly softened and away fixtures are slightly increased by the venue factors."
                        />
                        <ModelFormulaRow
                          label="overall run score"
                          formula="average fixtureDifficulty across selected fixtures"
                          detail="The run label and score summarize the whole set of selected upcoming matches."
                        />
                      </div>
                      <p className="text-sm leading-6 text-base-content/68">
                        Alpha 0.4 is a reasonable default because it gives recent momentum real
                        influence without letting short-term swings completely take over the model.
                      </p>
                    </div>
                  </div>
                </ModelDetails>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
