"use client";

import { useEffect } from "react";
import { StatusAlert } from "@/components/ui/status-alert";
import { PageContainer } from "@/components/layout/page-container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer className="min-h-screen items-center justify-center py-20">
      <div className="max-w-xl space-y-6">
        <StatusAlert
          variant="error"
          title="The frontend hit an unexpected error"
          description="Phase 1 adds the global error boundary now so later API work has a consistent failure surface."
        />
        <button type="button" className="btn btn-primary rounded-full px-6" onClick={reset}>
          Try again
        </button>
      </div>
    </PageContainer>
  );
}
