import Link from "next/link";
import { StatusAlert } from "@/components/ui/status-alert";

type GlobalErrorStateProps = {
  description: string;
  digest?: string;
  onRetry: () => void;
};

export function GlobalErrorState({
  description,
  digest,
  onRetry,
}: GlobalErrorStateProps) {
  return (
    <div className="surface-card max-w-2xl rounded-[1.9rem] p-6 sm:p-8">
      <p className="section-kicker">Unexpected error</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-base-content">
        We hit a problem loading this screen
      </h1>
      <div className="mt-5">
        <StatusAlert
          variant="error"
          title="Something went wrong"
          description={description}
        />
      </div>
      {digest ? (
        <p className="mt-4 text-xs leading-5 text-base-content/55">
          Error reference: <span className="font-mono">{digest}</span>
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary rounded-full px-6" onClick={onRetry}>
          Try again
        </button>
        <Link href="/teams" className="btn btn-ghost rounded-full border border-base-content/10 px-6">
          Open teams
        </Link>
      </div>
    </div>
  );
}
