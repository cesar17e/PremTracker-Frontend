"use client";

import { SettingsPanel } from "@/components/settings/settings-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatusAlert } from "@/components/ui/status-alert";
import { useSettings } from "@/hooks/use-settings";

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <LoadingSkeleton className="h-40 rounded-[1.7rem]" />
      <LoadingSkeleton className="h-40 rounded-[1.7rem]" />
      <LoadingSkeleton className="h-28 rounded-[1.7rem]" />
    </div>
  );
}

export default function SettingsPage() {
  const {
    settings,
    status,
    errorMessage,
    verifyPending,
    togglePending,
    sendPending,
    verifyResponse,
    emailResponse,
    reloadSettings,
    resendVerification,
    setEmailOptIn,
    sendFixtureDigest,
  } = useSettings();

  return (
    <div className="w-full max-w-6xl space-y-5">
      <section className="rounded-[1.7rem] border border-base-content/10 bg-base-content/[0.04] p-5 sm:p-6">
        <p className="section-kicker">Settings</p>
        <h1 className="mt-3 text-[1.85rem] font-semibold tracking-[-0.03em] text-base-content">
          Verification and reminder settings
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/70">
          Manage the email checks and reminder rules that the backend already enforces for this
          account.
        </p>
      </section>

      {status === "loading" ? <SettingsSkeleton /> : null}

      {status === "error" ? (
        <div className="space-y-4">
          <StatusAlert
            variant="error"
            title="We couldn't load your settings"
            description={errorMessage ?? "Please try again."}
          />
          <button
            type="button"
            className="btn btn-primary rounded-full px-6"
            onClick={() => void reloadSettings()}
          >
            Try again
          </button>
        </div>
      ) : null}

      {status === "ready" && settings ? (
        <SettingsPanel
          settings={settings}
          errorMessage={errorMessage}
          verifyPending={verifyPending}
          togglePending={togglePending}
          sendPending={sendPending}
          verifyResponse={verifyResponse}
          emailResponse={emailResponse}
          onResendVerification={resendVerification}
          onToggleOptIn={setEmailOptIn}
          onSendFixtureEmail={sendFixtureDigest}
        />
      ) : null}
    </div>
  );
}
