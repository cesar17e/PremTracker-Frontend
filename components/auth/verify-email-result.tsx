"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { VerificationResultCard } from "@/components/auth/verification-result-card";
import { verifyEmailTokenRequest } from "@/lib/api/auth";
import { parseVerifyPageState } from "@/lib/auth/recovery";
import { isAppApiError } from "@/lib/api/errors";

type VerificationState =
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function VerifyEmailResult() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>({
    status: "loading",
    message: "Verifying your email now.",
  });

  const pageState = parseVerifyPageState(searchParams);

  useEffect(() => {
    if (pageState.status || pageState.message || !pageState.token) {
      return;
    }

    let isActive = true;

    async function verifyToken() {
      setState({
        status: "loading",
        message: "Verifying your email now.",
      });

      try {
        const response = await verifyEmailTokenRequest(pageState.token!);
        if (!isActive) {
          return;
        }

        setState({
          status: response.ok ? "success" : "error",
          message: response.message,
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setState({
          status: "error",
          message:
            isAppApiError(error)
              ? error.message
              : "We couldn't verify your email.",
        });
      }
    }

    void verifyToken();

    return () => {
      isActive = false;
    };
  }, [pageState.message, pageState.status, pageState.token]);

  if (pageState.status && pageState.message) {
    return (
      <VerificationResultCard
        status={pageState.status}
        title={
          pageState.status === "success"
            ? "Email verification complete"
            : "Email verification failed"
        }
        description={pageState.message}
        actions={
          pageState.status === "success" ? (
            <Link href="/login" className="btn btn-primary rounded-full px-5">
              Continue to login
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary rounded-full px-5">
              Back to login
            </Link>
          )
        }
        footerLinkHref={pageState.status === "success" ? "/login" : "/register"}
        footerLinkLabel={
          pageState.status === "success" ? "Back to login" : "Create a new account"
        }
      />
    );
  }

  if (!pageState.token) {
    return (
      <VerificationResultCard
        status="error"
        title="Email verification failed"
        description="Missing verification token. Open this page from your email verification link."
        actions={
          <Link href="/login" className="btn btn-primary rounded-full px-5">
            Back to login
          </Link>
        }
        footerLinkHref="/register"
        footerLinkLabel="Create a new account"
      />
    );
  }

  if (state.status === "loading") {
    return (
      <VerificationResultCard
        status="info"
        title="Verifying your email"
        description={state.message}
      />
    );
  }

  return (
    <VerificationResultCard
      status={state.status}
      title={
        state.status === "success"
          ? "Email verification complete"
          : "Email verification failed"
      }
      description={state.message}
      actions={
        state.status === "success" ? (
          <Link href="/login" className="btn btn-primary rounded-full px-5">
            Continue to login
          </Link>
        ) : (
          <Link href="/login" className="btn btn-primary rounded-full px-5">
            Back to login
          </Link>
        )
      }
      footerLinkHref={state.status === "success" ? "/login" : "/register"}
      footerLinkLabel={
        state.status === "success" ? "Back to login" : "Create a new account"
      }
    />
  );
}
