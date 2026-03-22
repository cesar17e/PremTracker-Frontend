"use client";

import { useEffect } from "react";
import { GlobalErrorState } from "@/components/states/global-error-state";
import { PageContainer } from "@/components/layout/page-container";

export default function GlobalError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer className="min-h-screen items-center justify-center py-20">
      <GlobalErrorState
        description="Something unexpected interrupted this screen. Try reloading the route, or head back into the main dashboard if the issue continues."
        digest={error.digest}
        onRetry={() => {
          if (unstable_retry) {
            unstable_retry();
            return;
          }

          reset();
        }}
      />
    </PageContainer>
  );
}
