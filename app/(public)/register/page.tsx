import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

const highlights = [
  {
    label: "Readable",
    value: "Clear form snapshots",
    note: "Get useful match context without learning a heavy dashboard.",
  },
  {
    label: "Focused",
    value: "Built for favorite clubs",
    note: "Keep the experience centered on the teams you follow most.",
  },
  {
    label: "Fixtures",
    value: "Fixture planning made simpler",
    note: "Read upcoming runs clearly and keep matchweek expectations grounded.",
  },
  {
    label: "Trends",
    value: "Longer movement made clearer",
    note: "Follow whether a club is improving, steady, or starting to drop off.",
  },
];

export default function RegisterPage() {
  return (
    <AuthPageShell
      eyebrow="Start with your clubs"
      title="Create your PremTracker account"
      description="Set up an account to follow favorite clubs, understand current form, and keep fixtures and trends in one clean product."
      highlights={highlights}
    >
      <Suspense
        fallback={
          <AuthCard
            title="Preparing account setup"
            description="Getting the registration view ready for your session."
          >
            <div className="space-y-3">
              <div className="skeleton h-11 rounded-2xl" />
              <div className="skeleton h-11 rounded-2xl" />
              <div className="skeleton h-11 rounded-2xl" />
              <div className="skeleton h-11 rounded-2xl" />
            </div>
          </AuthCard>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthPageShell>
  );
}