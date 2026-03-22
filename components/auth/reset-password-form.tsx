"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { PasswordResetSuccessNotice } from "@/components/auth/password-reset-success-notice";
import { VerificationResultCard } from "@/components/auth/verification-result-card";
import { StatusAlert } from "@/components/ui/status-alert";
import {
  getResetPasswordLinkRequest,
  resetPasswordRequest,
} from "@/lib/api/auth";
import { parseResetTokenFromSearchParams } from "@/lib/auth/recovery";
import { getActionErrorMessage, isAppApiError } from "@/lib/api/errors";

type PrepareState =
  | { status: "loading"; token: string | null; error: string | null }
  | { status: "ready"; token: string; error: string | null }
  | { status: "error"; token: string | null; error: string };

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [prepareState, setPrepareState] = useState<PrepareState>({
    status: "loading",
    token: null,
    error: null,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const tokenFromQuery = parseResetTokenFromSearchParams(searchParams);

  useEffect(() => {
    if (typeof tokenFromQuery !== "string" || !tokenFromQuery) {
        setPrepareState({
          status: "error",
          token: null,
          error: "Missing reset token. Open this page from your password reset email link.",
        });
      return;
    }

    const resolvedToken = tokenFromQuery;
    let isActive = true;

    async function prepareReset() {
      setPrepareState({
        status: "loading",
        token: resolvedToken,
        error: null,
      });

      try {
        const response = await getResetPasswordLinkRequest(resolvedToken);
        if (!isActive) {
          return;
        }

        setPrepareState({
          status: "ready",
          token: response.token,
          error: null,
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPrepareState({
          status: "error",
          token: resolvedToken,
          error:
            isAppApiError(error)
              ? error.message
              : "We couldn't prepare the reset token.",
        });
      }
    }

    void prepareReset();

    return () => {
      isActive = false;
    };
  }, [tokenFromQuery]);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      router.replace("/login");
    }, 1400);

    return () => window.clearTimeout(timeout);
  }, [router, success]);

  async function handleSubmit(formData: FormData) {
    if (prepareState.status !== "ready") {
      return;
    }

    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (typeof newPassword !== "string" || typeof confirmPassword !== "string") {
      setErrorMessage("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Your new password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("The password confirmation does not match.");
      return;
    }

    setPending(true);
    setErrorMessage(null);

    try {
      await resetPasswordRequest(prepareState.token, newPassword);
      setSuccess(true);
    } catch (error) {
      setErrorMessage(
        getActionErrorMessage(error, "We couldn't reset your password. Please try again.")
      );
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return <PasswordResetSuccessNotice />;
  }

  if (prepareState.status === "error") {
    return (
      <VerificationResultCard
        status="error"
        title="Reset link unavailable"
        description={prepareState.error}
        actions={
          <Link href="/forgot-password" className="btn btn-primary rounded-full px-5">
            Request a new link
          </Link>
        }
        footerLinkHref="/login"
        footerLinkLabel="Back to login"
      />
    );
  }

  if (prepareState.status === "loading") {
    return (
      <AuthCard
        title="Preparing your reset"
        description="Checking the reset token and getting the password form ready."
      >
        <div className="space-y-3">
          <div className="skeleton h-11 rounded-2xl" />
          <div className="skeleton h-11 rounded-2xl" />
          <div className="skeleton h-11 rounded-2xl" />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      description="Set a new password for your account. Once this succeeds, you will return to login and sign in again."
      footer={
        <p className="text-sm leading-6 text-base-content/70">
          Need a fresh link?{" "}
          <Link href="/forgot-password" className="font-semibold text-primary">
            Request another reset
          </Link>
          .
        </p>
      }
    >
      <form action={handleSubmit} className="space-y-4">
        {errorMessage ? (
          <StatusAlert
            variant="error"
            title="Password reset failed"
            description={errorMessage}
          />
        ) : null}

        <label className="space-y-2">
          <span className="text-sm font-medium text-base-content">New password</span>
          <input
            required
            minLength={8}
            type="password"
            name="newPassword"
            autoFocus
            placeholder="Choose a new password"
            className="input input-bordered h-11 w-full rounded-2xl border-base-content/12 bg-base-100/60"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-base-content">Confirm password</span>
          <input
            required
            minLength={8}
            type="password"
            name="confirmPassword"
            placeholder="Repeat the new password"
            className="input input-bordered h-11 w-full rounded-2xl border-base-content/12 bg-base-100/60"
          />
        </label>

        <p className="text-sm leading-6 text-base-content/58">
          This reset flow does not create a session automatically. After success, you will return
          to login.
        </p>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary h-11 w-full rounded-full px-6"
        >
          {pending ? "Updating..." : "Reset password"}
        </button>
      </form>
    </AuthCard>
  );
}
