"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { StatusAlert } from "@/components/ui/status-alert";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useAuth } from "@/hooks/use-auth";
import type { ReactNode } from "react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { status, lastError, restoreSession, clearError } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (status !== "unauthenticated" || lastError) {
      return;
    }

    const query = searchParams.toString();
    const next = `${pathname}${query ? `?${query}` : ""}`;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [lastError, pathname, router, searchParams, status]);

  if (status === "loading") {
    return (
      <div className="w-full max-w-3xl space-y-4">
        <div className="surface-card rounded-[2rem] p-8">
          <p className="section-kicker">Session</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-base-content">
            Loading your PremTracker workspace
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/70">
            Checking your saved session and getting the dashboard shell ready.
          </p>

          <div className="mt-8 space-y-4">
            <LoadingSkeleton className="h-16 rounded-2xl" />
            <LoadingSkeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" && lastError) {
    return (
      <div className="w-full max-w-3xl space-y-6">
        <StatusAlert
          variant="error"
          title="We couldn't restore your session"
          description={lastError}
        />

        <div className="surface-card rounded-[2rem] p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="btn btn-primary rounded-full px-6"
              onClick={async () => {
                clearError();
                await restoreSession();
              }}
            >
              Try again
            </button>
            <Link href="/" className="btn btn-ghost rounded-full border border-base-content/10 px-6">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="w-full max-w-3xl space-y-4">
        <div className="surface-card rounded-[2rem] p-8">
          <p className="section-kicker">Session</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-base-content">
            Redirecting to login
          </h1>
          <p className="mt-3 text-sm leading-6 text-base-content/70">
            Your dashboard routes require an active session.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
