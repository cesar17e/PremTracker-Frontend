import Link from "next/link";

type ForbiddenStateProps = {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function ForbiddenState({
  title = "You do not have access to this area",
  description = "This screen is only available to accounts with admin access.",
  actionHref = "/teams",
  actionLabel = "Back to teams",
}: ForbiddenStateProps) {
  return (
    <div className="surface-card max-w-2xl rounded-[1.7rem] p-6 sm:p-7">
      <p className="section-kicker">Restricted</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-base-content">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-base-content/70">{description}</p>
      <div className="mt-6">
        <Link href={actionHref} className="btn btn-primary rounded-full px-6">
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
