"use client";

type TrendSeriesCardProps = {
  title: string;
  subtitle: string;
  explanation: string;
  currentLabel: string;
  changeLabel: string;
  takeaway: {
    improving: string;
    declining: string;
    stable: string;
  };
  values: number[];
  labels: string[];
  betterDirection?: "up" | "down";
};

const STABLE_DELTA_THRESHOLD = 0.08;

export type TrendDirection = "improving" | "declining" | "stable";

function getTrendStatus(delta: number, betterDirection: "up" | "down"): TrendDirection {
  if (Math.abs(delta) < STABLE_DELTA_THRESHOLD) {
    return "stable";
  }

  if (betterDirection === "up") {
    return delta > 0 ? "improving" : "declining";
  }

  return delta < 0 ? "improving" : "declining";
}

function getTrendTone(status: ReturnType<typeof getTrendStatus>) {
  if (status === "improving") {
    return "bg-primary/14 text-primary";
  }

  if (status === "declining") {
    return "bg-error/14 text-error";
  }

  return "bg-base-content/[0.08] text-base-content/78";
}

function getTrendDirectionTone(delta: number, betterDirection: "up" | "down") {
  if (Math.abs(delta) < STABLE_DELTA_THRESHOLD) {
    return "bg-base-content/[0.06] text-base-content/72";
  }

  const favorable =
    (betterDirection === "up" && delta > 0) ||
    (betterDirection === "down" && delta < 0);

  return favorable ? "bg-primary/10 text-primary" : "bg-error/10 text-error";
}

export function getTrendStatusFromSeries(
  values: number[],
  betterDirection: "up" | "down" = "up"
): TrendDirection {
  if (!values.length) {
    return "stable";
  }

  const latest = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? latest;
  return getTrendStatus(latest - previous, betterDirection);
}

function getDirectionText(delta: number, changeLabel: string) {
  if (Math.abs(delta) < STABLE_DELTA_THRESHOLD) {
    return "Holding close to the previous rolling window.";
  }

  return `${delta > 0 ? "Up" : "Down"} ${Math.abs(delta).toFixed(2)} ${changeLabel} versus the previous rolling window.`;
}

function getTrendDeltaNote(
  delta: number,
  betterDirection: "up" | "down",
  changeLabel: string
) {
  if (Math.abs(delta) < STABLE_DELTA_THRESHOLD) {
    return `Change is minimal versus the previous rolling window, so ${changeLabel} is broadly steady.`;
  }

  if (betterDirection === "down") {
    return delta < 0
      ? `This is favorable because lower ${changeLabel} is better for the team.`
      : `This is unfavorable because higher ${changeLabel} is worse for the team.`;
  }

  return delta > 0
    ? `This is favorable because higher ${changeLabel} is helping the team.`
    : `This is unfavorable because lower ${changeLabel} points to a weaker recent window.`;
}

function getSparklinePoints(values: number[]) {
  if (values.length === 1) {
    return "50,26";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = max === min ? 26 : 44 - (((value - min) / (max - min)) * 36 + 4);
      return `${x},${y}`;
    })
    .join(" ");
}

export function TrendSeriesCard({
  title,
  subtitle,
  explanation,
  currentLabel,
  changeLabel,
  takeaway,
  values,
  labels,
  betterDirection = "up",
}: TrendSeriesCardProps) {
  if (!values.length) {
    return (
      <div className="surface-card rounded-[1.5rem] p-5">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
          {title}
        </p>
        <p className="mt-3 text-sm leading-6 text-base-content/70">{subtitle}</p>
        <p className="mt-5 text-sm text-base-content/58">Not enough finished matches yet.</p>
      </div>
    );
  }

  const latest = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? latest;
  const delta = latest - previous;
  const status = getTrendStatus(delta, betterDirection);
  const sparklinePoints = getSparklinePoints(values);

  return (
    <div className="surface-card rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-base-content/70">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.05] px-4 py-3">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
            {currentLabel}
          </p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-[1.8rem] font-semibold tracking-[-0.03em] text-base-content">
              {latest.toFixed(2)}
            </p>
            <p className="pb-1 text-xs uppercase tracking-[0.14em] text-base-content/52">
              Latest window
            </p>
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.05] px-4 py-3">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
            Change vs previous window
          </p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-[1.55rem] font-semibold tracking-[-0.03em] text-base-content">
              {delta > 0 ? "+" : ""}
              {delta.toFixed(2)}
            </p>
            <p className="pb-1 text-xs uppercase tracking-[0.14em] text-base-content/52">
              {changeLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${getTrendTone(status)}`}>
          {status}
        </span>
        <span className="rounded-full border border-base-content/10 bg-base-content/[0.04] px-3 py-1 text-sm text-base-content/72">
          {getDirectionText(delta, changeLabel)}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-sm ${getTrendDirectionTone(
            delta,
            betterDirection
          )}`}
        >
          {getTrendDeltaNote(delta, betterDirection, changeLabel)}
        </span>
      </div>

      <div className="mt-5 rounded-[1.25rem] border border-base-content/10 bg-base-content/[0.03] p-4">
        <div className="flex items-center justify-between text-[0.72rem] uppercase tracking-[0.14em] text-base-content/48">
          <span>Older windows</span>
          <span>Latest</span>
        </div>

        <div className="mt-3">
          <svg
            viewBox="0 0 100 48"
            className="h-24 w-full overflow-visible"
            role="img"
            aria-label={`${title} rolling trend`}
          >
            <path
              d="M 0 44 H 100"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
            <polyline
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklinePoints}
            />
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklinePoints}
              className="text-primary"
            />
            {values.map((value, index) => {
              const point =
                sparklinePoints.split(" ")[index] ??
                `${(index / Math.max(values.length - 1, 1)) * 100},26`;
              const [cx, cy] = point.split(",");

              return (
                <circle
                  key={`${labels[index]}-${value}`}
                  cx={cx}
                  cy={cy}
                  r={index === values.length - 1 ? 2.8 : 1.9}
                  className={index === values.length - 1 ? "fill-current text-primary" : "fill-current text-base-content/35"}
                >
                  <title>{`${labels[index]}: ${value.toFixed(2)}`}</title>
                </circle>
              );
            })}
          </svg>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-base-content/80">{takeaway[status]}</p>
      <p className="mt-2 text-sm leading-6 text-base-content/68">{explanation}</p>
    </div>
  );
}
