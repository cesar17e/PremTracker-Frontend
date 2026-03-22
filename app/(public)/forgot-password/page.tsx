import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

const highlights = [
  {
    label: "Recovery",
    value: "Neutral account flow",
    note: "The request response stays neutral whether or not the email exists.",
  },
  {
    label: "Email",
    value: "Reset link support",
    note: "The backend issues a reset token link for valid accounts.",
  },
  {
    label: "Private",
    value: "Account-safe response",
    note: "The flow does not reveal whether a specific email is registered.",
  },
  {
    label: "Next",
    value: "Back to login after reset",
    note: "A completed password reset returns the user to the login flow.",
  },
];

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      eyebrow="Recover your account"
      title="Request a password reset"
      description="Start the recovery flow for your PremTracker account without exposing whether an email is registered."
      highlights={highlights}
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
