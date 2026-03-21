import type { HTMLAttributes } from "react";

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description: string;
  eyebrow?: string;
};

export function EmptyState({
  title,
  description,
  eyebrow = "In progress",
  className = "",
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={`surface-card rounded-[1.6rem] p-5 text-left sm:p-6 ${className}`.trim()}
      {...props}
    >
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
        {eyebrow}
      </p>
      <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-base-content">{title}</p>
      <p className="mt-2 text-sm leading-6 text-base-content/68">{description}</p>
    </div>
  );
}
