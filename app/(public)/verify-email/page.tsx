import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { VerifyEmailResult } from "@/components/auth/verify-email-result";

const highlights = [
  {
    label: "Verify",
    value: "Email status result",
    note: "This screen handles success and error states from the backend verification flow.",
  },
  {
    label: "Result",
    value: "Clear verification outcome",
    note: "This page confirms whether your email verification link succeeded or failed.",
  },
  {
    label: "Access",
    value: "Unlock email features",
    note: "Verified accounts can use reminder preferences and email actions in settings.",
  },
  {
    label: "Next",
    value: "Continue into the app",
    note: "After verification, sign in and continue to your saved clubs and analytics pages.",
  },
];

export default function VerifyEmailPage() {
  return (
    <AuthPageShell
      eyebrow="Complete account setup"
      title="Verify your email"
      description="Finish the email verification step and confirm whether the backend verification flow succeeded."
      highlights={highlights}
    >
      <Suspense
        fallback={
          <AuthCard
            title="Preparing verification result"
            description="Checking the verification state and getting the result screen ready."
          >
            <div className="space-y-3">
              <div className="skeleton h-11 rounded-2xl" />
              <div className="skeleton h-11 rounded-2xl" />
            </div>
          </AuthCard>
        }
      >
        <VerifyEmailResult />
      </Suspense>
    </AuthPageShell>
  );
}
