import type { ReactNode } from "react";

type ModelDetailsProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
};

export function ModelDetails({
  title,
  description,
  eyebrow = "How this is calculated",
  children,
}: ModelDetailsProps) {
  return (
    <details className="group rounded-[1.5rem] border border-base-content/10 bg-base-content/[0.04]">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <div className="space-y-2">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
            {eyebrow}
          </p>
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-base-content">{title}</h3>
          <p className="text-sm leading-6 text-base-content/68">{description}</p>
        </div>

        <span className="rounded-full border border-base-content/10 bg-base-content/[0.04] px-3 py-1 text-sm text-base-content/72 transition group-open:bg-base-content/[0.08]">
          Expand
        </span>
      </summary>

      <div className="border-t border-base-content/10 px-5 py-5">{children}</div>
    </details>
  );
}
