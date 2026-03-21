"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { StatusAlert } from "@/components/ui/status-alert";
import { useAuth } from "@/hooks/use-auth";
import { isAppApiError } from "@/lib/api/errors";

function getSafeNextPath(nextPath: string | null) {
  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    return nextPath;
  }

  return "/teams";
}

export function RegisterForm() {
  const { register, status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nextPath = getSafeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(nextPath);
    }
  }, [nextPath, router, status]);

  if (status === "loading") {
    return (
      <AuthCard
        title="Checking your session"
        description="If you already have an account open, we'll send you straight to the dashboard."
      >
        <div className="space-y-3">
          <div className="skeleton h-11 rounded-2xl" />
          <div className="skeleton h-11 rounded-2xl" />
          <div className="skeleton h-11 rounded-2xl" />
          <div className="skeleton h-24 rounded-[1.5rem]" />
        </div>
      </AuthCard>
    );
  }

  if (status === "authenticated") {
    return (
      <AuthCard
        title="Account ready"
        description="You already have an active session, so there is nothing else to set up here."
      >
        <StatusAlert
          variant="success"
          title="Redirecting to your dashboard"
          description="Use the button below if you want to continue immediately."
          actions={
            <Link href={nextPath} className="btn btn-primary rounded-full px-5">
              Open dashboard
            </Link>
          }
        />
      </AuthCard>
    );
  }

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      setErrorMessage("Please complete all fields before creating your account.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Your passwords need to match.");
      return;
    }

    setPending(true);
    setErrorMessage(null);

    try {
      await register({
        email: email.trim(),
        password,
      });
      router.replace(nextPath);
    } catch (error) {
      setErrorMessage(
        isAppApiError(error)
          ? error.message
          : "We couldn't create your account. Please try again."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Create your PremTracker account"
      description="Set up your account and start tracking the Premier League clubs you care about most."
      footer={
        <p className="text-sm leading-6 text-base-content/70">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Log in instead
          </Link>
          .
        </p>
      }
    >
      <form action={handleSubmit} className="space-y-4">
        {errorMessage ? (
          <StatusAlert
            variant="error"
            title="Registration failed"
            description={errorMessage}
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

        <label className="space-y-2">
          <span className="text-sm font-medium text-base-content">Password</span>
          <input
            required
            minLength={8}
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Use at least 8 characters"
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
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className="input input-bordered h-11 w-full rounded-2xl border-base-content/12 bg-base-100/60"
          />
        </label>

        <p className="text-sm leading-6 text-base-content/58">
          You can verify your email after account creation.
        </p>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary h-11 w-full rounded-full px-6"
        >
          {pending ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
