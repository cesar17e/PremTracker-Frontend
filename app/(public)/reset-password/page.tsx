import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your PremTracker account.",
};

const highlights = [
  {
    label: "Secure",
    value: "Token-based reset",
    note: "Password resets depend on a backend-issued token rather than an active session.",
  },
  {
    label: "Clear",
    value: "Return to login",
    note: "A successful reset does not auto-login. The flow returns the user to sign in again.",
  },
  {
    label: "Reliable",
    value: "Link-driven reset",
    note: "This page expects a valid password reset link and prepares the account for a new password.",
  },
  {
    label: "Focused",
    value: "One task",
    note: "This page only prepares and submits the new password for the provided token.",
  },
];

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      eyebrow="Finish account recovery"
      title="Set a new password"
      description="Use the reset token from the email flow to choose a new password, then continue back to login."
      highlights={highlights}
    >
      <Suspense
        fallback={
          <AuthCard
            title="Preparing reset"
            description="Checking the reset token and getting the password form ready."
          >
            <div className="space-y-3">
              <div className="skeleton h-11 rounded-2xl" />
              <div className="skeleton h-11 rounded-2xl" />
              <div className="skeleton h-11 rounded-2xl" />
            </div>
          </AuthCard>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
