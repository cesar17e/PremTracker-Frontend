"use client";

import { useMemo, useState } from "react";
import { RateLimitNotice } from "@/components/states/rate-limit-notice";
import { ForbiddenState } from "@/components/states/forbidden-state";
import { StatusAlert } from "@/components/ui/status-alert";
import { runAdminSyncRequest } from "@/lib/api/admin";
import { isAppApiError } from "@/lib/api/errors";
import { useAuth } from "@/hooks/use-auth";
import type { AdminSyncResponse } from "@/types/admin";

type SyncState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; data: AdminSyncResponse }
  | {
      status: "error";
      message: string;
      code: "sunday" | "admin" | "rate-limit" | "unavailable" | "generic";
    };

function getRunLabel(count: number) {
  if (count >= 5) return "Heavy refresh";
  if (count >= 3) return "Meaningful update";
  return "Light update";
}

function getSummary(state: Extract<SyncState, { status: "success" }>["data"]) {
  if (state.failed === 0) {
    return "The sync completed cleanly and the match store was refreshed without reported failures.";
  }

  return `The sync finished with ${state.failed} item${state.failed === 1 ? "" : "s"} skipped or failed during upsert.`;
}

function getErrorState(error: unknown): Extract<SyncState, { status: "error" }> {
  if (isAppApiError(error)) {
    const message = error.message;

    if (error.status === 429) {
      return {
        status: "error",
        message,
        code: "rate-limit",
      };
    }

    if (error.status === 403 && /sunday/i.test(message)) {
      return {
        status: "error",
        message,
        code: "sunday",
      };
    }

    if (error.status === 403 && /admin/i.test(message)) {
      return {
        status: "error",
        message,
        code: "admin",
      };
    }

    if (error.status === 503) {
      return {
        status: "error",
        message:
          "This sync is temporarily unavailable while the backend protection layer is unavailable. Please try again shortly.",
        code: "unavailable",
      };
    }

    return {
      status: "error",
      message,
      code: "generic",
    };
  }

  return {
    status: "error",
    message: "We couldn't run the sync right now.",
    code: "generic",
  };
}

export function AdminSyncPanel() {
  const { user } = useAuth();
  const [syncState, setSyncState] = useState<SyncState>({ status: "idle" });

  const adminSummary = useMemo(() => {
    if (syncState.status !== "success") {
      return null;
    }

    return getSummary(syncState.data);
  }, [syncState]);

  if (!user?.isAdmin) {
    return (
      <ForbiddenState
        title="Admin sync is not available for this account"
        description="This route is reserved for admins because it triggers a protected backend sync job."
      />
    );
  }

  async function handleRunSync() {
    setSyncState({ status: "pending" });

    try {
      const response = await runAdminSyncRequest();
      setSyncState({ status: "success", data: response });
    } catch (error) {
      setSyncState(getErrorState(error));
    }
  }

  return (
    <div className="w-full max-w-6xl space-y-5">
      <section className="rounded-[1.7rem] border border-base-content/10 bg-base-content/[0.04] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="section-kicker">Admin</p>
            <h1 className="mt-3 text-[1.85rem] font-semibold tracking-[-0.03em] text-base-content">
              EPL sync control
            </h1>
            <p className="mt-3 text-sm leading-6 text-base-content/70">
              Run the protected backend sync job that refreshes recent results and upcoming
              fixtures used throughout the product. This page is intentionally narrow: admin-only,
              Sunday-only, and rate-limited once per day.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="badge badge-outline rounded-full border-base-content/12 px-3 py-3 text-base-content/75">
              Admin only
            </span>
            <span className="badge badge-outline rounded-full border-base-content/12 px-3 py-3 text-base-content/75">
              Sunday only
            </span>
            <span className="badge badge-outline rounded-full border-base-content/12 px-3 py-3 text-base-content/75">
              1 run per day
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <div className="surface-card rounded-[1.5rem] p-5">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
              What this does
            </p>
            <p className="mt-3 text-sm leading-6 text-base-content/75">
              Use this when you want to refresh the backend match store before reviewing team form,
              trends, or fixture difficulty. It updates the core dataset rather than a single page.
            </p>
          </div>

          <div className="surface-card rounded-[1.5rem] p-5">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
              Action
            </p>
            <button
              type="button"
              className="btn btn-primary mt-4 w-full rounded-full px-6 disabled:cursor-wait"
              onClick={() => void handleRunSync()}
              disabled={syncState.status === "pending"}
              aria-busy={syncState.status === "pending"}
            >
              {syncState.status === "pending" ? (
                <>
                  <span className="loading loading-spinner loading-xs" aria-hidden="true" />
                  <span>Running sync...</span>
                </>
              ) : (
                "Run sync now"
              )}
            </button>
            <p className="mt-3 text-sm leading-6 text-base-content/60">
              Use this carefully. The backend enforces access rules even if this page is visible.
            </p>
          </div>
        </div>
      </section>

      {syncState.status === "error" && syncState.code === "rate-limit" ? (
        <RateLimitNotice
          title="Daily sync limit reached"
          description="This admin sync is limited to one successful attempt per admin each day. Try again on the next available run window."
        />
      ) : null}

      {syncState.status === "error" && syncState.code === "sunday" ? (
        <StatusAlert
          variant="warning"
          title="Sync is only available on Sunday"
          description="The backend rejected this run because the current day is outside the allowed sync window."
        />
      ) : null}

      {syncState.status === "error" && syncState.code === "unavailable" ? (
        <StatusAlert
          variant="warning"
          title="Sync temporarily unavailable"
          description={syncState.message}
        />
      ) : null}

      {syncState.status === "error" && syncState.code === "generic" ? (
        <StatusAlert
          variant="error"
          title="We couldn't run the sync"
          description={syncState.message}
        />
      ) : null}

      {syncState.status === "success" ? (
        <section className="space-y-4">
          <div className="surface-card rounded-[1.7rem] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <p className="section-kicker">Latest run</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-base-content">
                  {getRunLabel(syncState.data.uniqueMatches)}
                </h2>
                <p className="mt-3 text-sm leading-6 text-base-content/70">
                  {adminSummary}
                </p>
              </div>
              <div className="rounded-[1.3rem] border border-primary/20 bg-primary/10 px-4 py-3 text-right">
                <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-primary/80">
                  Response
                </p>
                <p className="mt-2 text-lg font-semibold text-primary">
                  {syncState.data.message}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "API calls", value: syncState.data.apiCalls },
              { label: "Unique matches", value: syncState.data.uniqueMatches },
              { label: "Upserted", value: syncState.data.upserted },
              { label: "Failed", value: syncState.data.failed },
            ].map((item) => (
              <div key={item.label} className="surface-card rounded-[1.5rem] p-5">
                <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-base-content">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
