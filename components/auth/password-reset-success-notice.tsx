import { PendingLink } from "@/components/ui/pending-link";
import { VerificationResultCard } from "@/components/auth/verification-result-card";

export function PasswordResetSuccessNotice() {
  return (
    <VerificationResultCard
      status="success"
      title="Password reset complete"
      description="Your password has been updated. We are sending you back to login so you can sign in again."
      actions={
        <PendingLink href="/login" replace pendingLabel="Opening..." className="btn btn-primary rounded-full px-5">
          Go to login
        </PendingLink>
      }
    />
  );
}
