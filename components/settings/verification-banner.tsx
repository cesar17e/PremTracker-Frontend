"use client";

import type { VerifyEmailRequestResponse } from "@/types/me";

type VerificationBannerProps = {
  emailVerified: boolean;
  verifyPending: boolean;
  verifyResponse: VerifyEmailRequestResponse | null;
  onResend: () => Promise<unknown>;
};

export function VerificationBanner({
  emailVerified,
  verifyPending,
  verifyResponse,
  onResend,
}: VerificationBannerProps) {
  if (emailVerified) {
    return (
      <section className="rounded-[1.6rem] border border-primary/20 bg-primary/10 p-5">
        <p className="section-kicker text-primary">Verification</p>
        <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-base-content">
          Email verified
        </h2>
        <p className="mt-3 text-sm leading-6 text-base-content/72">
          Your account can use fixture reminder settings and verification-only email actions.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.6rem] border border-warning/25 bg-warning/10 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="section-kicker text-warning">Verification needed</p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-base-content">
            Verify your email to unlock reminders
          </h2>
          <p className="mt-3 text-sm leading-6 text-base-content/72">
            Reminder opt-in and fixture emails require a verified email address. Resend the
            verification link when you are ready.
          </p>
        </div>

        <button
          type="button"
          disabled={verifyPending}
          className="btn btn-primary w-full rounded-full px-5 sm:w-auto"
          onClick={() => void onResend()}
        >
          {verifyPending ? "Sending..." : "Resend verification"}
        </button>
      </div>

      {verifyResponse ? (
        <div className="mt-4 rounded-[1.2rem] border border-base-content/10 bg-base-content/[0.04] p-4">
          <p className="text-sm font-semibold text-base-content">
            {verifyResponse.message}
          </p>
          {verifyResponse.verifyLink ? (
            <a
              href={verifyResponse.verifyLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Open verification link
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
