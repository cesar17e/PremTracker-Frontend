import type { HTMLAttributes } from "react";

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description: string;
};

export function EmptyState({
  title,
  description,
  className = "",
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={`surface-card rounded-[1.5rem] p-6 text-left ${className}`.trim()}
      {...props}
    >
      <p className="text-lg font-semibold tracking-[-0.02em] text-base-content">{title}</p>
      <p className="mt-2 text-sm leading-6 text-base-content/65">{description}</p>
    </div>
  );
}
