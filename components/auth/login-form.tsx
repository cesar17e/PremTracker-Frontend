"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { StatusAlert } from "@/components/ui/status-alert";
import { AuthCard } from "@/components/auth/auth-card";
import { PendingLink } from "@/components/ui/pending-link";
import { useAuth } from "@/hooks/use-auth";
import { getActionErrorMessage } from "@/lib/api/errors";

function getSafeNextPath(nextPath: string | null) {
  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    return nextPath;
  }

  return "/teams";
}

export function LoginForm() {
  const { login, status } = useAuth();
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
        title="Restoring your session"
        description="Checking whether you already have an active PremTracker session."
      >
        <div className="space-y-3">
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
        title="Session ready"
        description="You already have access to your dashboard, so we're sending you there now."
      >
        <StatusAlert
          variant="success"
          title="Redirecting to your dashboard"
          description="If this takes a moment, use the button below."
          actions={
            <PendingLink
              href={nextPath}
              replace
              pendingLabel="Opening..."
              className="btn btn-primary rounded-full px-5"
            >
              Open dashboard
            </PendingLink>
          }
        />
      </AuthCard>
    );
  }

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      setErrorMessage("Please fill in your email and password.");
      return;
    }

    flushSync(() => {
      setPending(true);
      setErrorMessage(null);
    });

    try {
      await login({
        email: email.trim(),
        password,
      });
      router.replace(nextPath);
    } catch (error) {
      setErrorMessage(getActionErrorMessage(error, "We couldn't log you in. Please try again."));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Log in to PremTracker"
      description="Use your account to get back to the clubs you follow, recent form, and the next run of fixtures."
      footer={
        <p className="text-sm leading-6 text-base-content/70">
          Need a new account?{" "}
          <Link href="/register" className="font-semibold text-primary">
            Create one here
          </Link>
          .
        </p>
      }
    >
      <form action={handleSubmit} className="space-y-4">
        {errorMessage ? (
          <StatusAlert
            variant="error"
            title="Login failed"
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
            autoComplete="current-password"
            placeholder="Enter your password"
            className="input input-bordered h-11 w-full rounded-2xl border-base-content/12 bg-base-100/60"
          />
        </label>

        <p className="text-sm leading-6 text-base-content/58">
          Forgot your password?{" "}
          <Link href="/forgot-password" className="font-semibold text-primary">
            Start a reset here
          </Link>
          .
        </p>

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="btn btn-primary h-11 w-full rounded-full px-6 disabled:cursor-wait"
        >
          <span className="inline-flex items-center gap-2">
            {pending ? <span className="loading loading-spinner loading-xs" aria-hidden="true" /> : null}
            <span>{pending ? "Logging in..." : "Log in"}</span>
          </span>
        </button>
      </form>
    </AuthCard>
  );
}
