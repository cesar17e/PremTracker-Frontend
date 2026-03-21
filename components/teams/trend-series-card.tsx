type TrendSeriesCardProps = {
  title: string;
  subtitle: string;
  values: number[];
  labels: string[];
};

function getBarHeight(value: number, min: number, max: number) {
  if (max === min) {
    return 56;
  }

  return 24 + ((value - min) / (max - min)) * 76;
}

export function TrendSeriesCard({
  title,
  subtitle,
  values,
  labels,
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
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="surface-card rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-base-content/70">{subtitle}</p>
        </div>
        <span className="rounded-full border border-base-content/10 bg-base-content/[0.04] px-3 py-1 text-sm font-semibold text-base-content">
          {latest.toFixed(2)}
        </span>
      </div>

      <div className="mt-6 flex h-28 items-end gap-2">
        {values.map((value, index) => (
          <div key={`${labels[index]}-${value}`} className="flex-1">
            <div
              className="w-full rounded-full bg-primary/80"
              style={{ height: `${getBarHeight(value, min, max)}%` }}
              title={`${labels[index]}: ${value.toFixed(2)}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
