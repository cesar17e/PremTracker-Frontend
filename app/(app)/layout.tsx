import { Suspense, type ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { AuthGate } from "@/lib/auth/auth-gate";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="w-full max-w-4xl space-y-4">
            <LoadingSkeleton className="h-24 rounded-[2rem]" />
            <LoadingSkeleton className="h-40 rounded-[2rem]" />
          </div>
        }
      >
        <AuthGate>{children}</AuthGate>
      </Suspense>
    </AppShell>
  );
}
