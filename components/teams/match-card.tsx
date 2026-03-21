import { formatDateTime } from "@/lib/format/dates";
import type { TeamMatch } from "@/types/teams";

function getResultTone(result: TeamMatch["perspective"]["result"]) {
  if (result === "W") return "bg-primary/14 text-primary";
  if (result === "L") return "bg-error/14 text-error";
  return "bg-base-content/[0.08] text-base-content/78";
}

function getOpponentLabel(match: TeamMatch) {
  const opponent = match.perspective.teamIsHome ? match.awayTeam : match.homeTeam;
  const venue = match.perspective.teamIsHome ? "vs" : "@";

  return {
    venue,
    opponentName: opponent?.shortName || opponent?.name || "Opponent",
  };
}

export function MatchCard({
  match,
  showResult = false,
}: {
  match: TeamMatch;
  showResult?: boolean;
}) {
  const { venue, opponentName } = getOpponentLabel(match);

  return (
    <article className="rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.04] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
            {match.ended ? "Completed match" : "Upcoming fixture"}
          </p>
          <p className="mt-2 text-base font-semibold text-base-content">
            {venue} {opponentName}
          </p>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            {formatDateTime(match.startTime)}
          </p>
        </div>

        {match.ended && showResult ? (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getResultTone(match.perspective.result)}`}>
            {match.perspective.result ?? "Final"}
          </span>
        ) : (
          <span className="rounded-full border border-base-content/10 bg-base-content/[0.05] px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
            {match.statusText || (match.ended ? "Final" : "Scheduled")}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-[1rem] border border-base-content/10 bg-base-content/[0.03] px-3 py-3 text-sm">
        <span className="text-base-content/72">
          {match.homeTeam?.shortName || match.homeTeam?.name || "Home"}
        </span>
        <span className="font-semibold text-base-content">
          {match.homeScore ?? "-"} : {match.awayScore ?? "-"}
        </span>
        <span className="text-base-content/72">
          {match.awayTeam?.shortName || match.awayTeam?.name || "Away"}
        </span>
      </div>
    </article>
  );
}
