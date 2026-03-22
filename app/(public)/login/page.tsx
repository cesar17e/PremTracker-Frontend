import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to PremTracker and return to your saved clubs and analytics.",
};

const highlights = [
  {
    label: "Form",
    value: "Readable match context",
    note: "Follow current form without digging through cluttered analytics views.",
  },
  {
    label: "Fixtures",
    value: "Clean fixture runs",
    note: "Keep the next stretch of matches easy to scan and compare.",
  },
  {
    label: "Favorites",
    value: "Your clubs first",
    note: "Stay focused on the teams you actually care about most.",
  },
  {
    label: "Trends",
    value: "Momentum you can follow",
    note: "See whether performances are improving, holding steady, or slipping.",
  },
];

export default function LoginPage() {
  return (
    <AuthPageShell
      eyebrow="Return to your dashboard"
      title="Log in to PremTracker"
      description="Get back to your clubs, recent form, upcoming fixtures, and trend views built for readability."
      highlights={highlights}
    >
      <Suspense
        fallback={
          <AuthCard
            title="Preparing login"
            description="Getting the sign-in view ready for your session."
          >
            <div className="space-y-3">
              <div className="skeleton h-11 rounded-2xl" />
              <div className="skeleton h-11 rounded-2xl" />
              <div className="skeleton h-11 rounded-2xl" />
            </div>
          </AuthCard>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
