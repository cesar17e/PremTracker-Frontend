"use client";

import Link from "next/link";
import { useState } from "react";
import { flushSync } from "react-dom";
import { AuthCard } from "@/components/auth/auth-card";
import { StatusAlert } from "@/components/ui/status-alert";
import { forgotPasswordRequest } from "@/lib/api/auth";
import { getActionErrorMessage } from "@/lib/api/errors";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email");

    if (typeof email !== "string" || !email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    flushSync(() => {
      setPending(true);
      setErrorMessage(null);
      setSuccessMessage(null);
    });

    try {
      const response = await forgotPasswordRequest(email.trim());
      setSuccessMessage(response.message);
    } catch (error) {
      setErrorMessage(
        getActionErrorMessage(error, "We couldn't submit the password reset request.")
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your account email and we will start the password reset flow. The response stays neutral whether or not an account exists."
      footer={
        <p className="text-sm leading-6 text-base-content/70">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Back to login
          </Link>
          .
        </p>
      }
    >
      <form action={handleSubmit} className="space-y-4">
        {errorMessage ? (
          <StatusAlert
            variant="error"
            title="Request failed"
            description={errorMessage}
          />
        ) : null}

        {successMessage ? (
          <StatusAlert
            variant="success"
            title="Request submitted"
            description={successMessage}
          />
        ) : null}

        <label className="space-y-2">
          <span className="text-sm font-medium text-base-content">Email</span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            className="input input-bordered h-11 w-full rounded-2xl border-base-content/12 bg-base-100/60"
          />
        </label>

        <p className="text-sm leading-6 text-base-content/58">
          If the email matches an account, we will send password reset instructions to that inbox.
        </p>

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="btn btn-primary h-11 w-full rounded-full px-6 disabled:cursor-wait"
        >
          <span className="inline-flex items-center gap-2">
            {pending ? <span className="loading loading-spinner loading-xs" aria-hidden="true" /> : null}
            <span>{pending ? "Submitting..." : "Send reset link"}</span>
          </span>
        </button>
      </form>
    </AuthCard>
  );
}
