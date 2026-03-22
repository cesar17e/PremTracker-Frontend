"use client";

import { StatusAlert } from "@/components/ui/status-alert";
import { ReminderToggle } from "@/components/settings/reminder-toggle";
import { SendFixtureEmailButton } from "@/components/settings/send-fixture-email-button";
import { VerificationBanner } from "@/components/settings/verification-banner";
import type {
  FixtureEmailResponse,
  SettingsResponse,
  VerifyEmailRequestResponse,
} from "@/types/me";

type SettingsPanelProps = {
  settings: SettingsResponse;
  errorMessage: string | null;
  verifyPending: boolean;
  togglePending: boolean;
  sendPending: boolean;
  verifyResponse: VerifyEmailRequestResponse | null;
  emailResponse: FixtureEmailResponse | null;
  onResendVerification: () => Promise<unknown>;
  onToggleOptIn: (nextValue: boolean) => Promise<unknown>;
  onSendFixtureEmail: () => Promise<unknown>;
};

function getReminderHelper(settings: SettingsResponse) {
  if (!settings.emailVerified && !settings.emailOptIn) {
    return "Enable fixture reminder emails for this account after verifying your email. This preference is the permission used for reminder delivery and future scheduled sending.";
  }

  if (settings.emailOptIn) {
    return "Fixture reminder emails are enabled for this account. This preference allows reminder delivery for your saved clubs and is also used for scheduled sending when enabled.";
  }

  return "Enable fixture reminder emails for this account. This preference allows reminder delivery for your saved clubs and is also used for scheduled sending when enabled.";
}

function getFixtureEmailHelper(settings: SettingsResponse) {
  if (!settings.emailVerified) {
    return "Verify your email first. The backend blocks fixture emails until the address is verified.";
  }

  if (!settings.emailOptIn) {
    return "Turn on reminder opt-in first. The backend requires explicit opt-in before sending fixture emails.";
  }

  return "Send the next upcoming fixture for each saved club to your email now.";
}

export function SettingsPanel({
  settings,
  errorMessage,
  verifyPending,
  togglePending,
  sendPending,
  verifyResponse,
  emailResponse,
  onResendVerification,
  onToggleOptIn,
  onSendFixtureEmail,
}: SettingsPanelProps) {
  return (
    <div className="space-y-5">
      <VerificationBanner
        emailVerified={settings.emailVerified}
        verifyPending={verifyPending}
        verifyResponse={verifyResponse}
        onResend={onResendVerification}
      />

      {errorMessage ? (
        <StatusAlert
          variant="error"
          title="Account action failed"
          description={errorMessage}
        />
      ) : null}

      {emailResponse ? (
        <StatusAlert
          variant={emailResponse.emailSent || emailResponse.mode === "demo" ? "success" : "warning"}
          title="Fixture email processed"
          description={`Checked ${emailResponse.favorites} favorite club(s), found ${emailResponse.fixturesFound} upcoming fixture(s), and targeted ${emailResponse.sentTo}.`}
        />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <ReminderToggle
          checked={settings.emailOptIn}
          disabled={!settings.emailVerified && !settings.emailOptIn}
          pending={togglePending}
          helperText={getReminderHelper(settings)}
          onChange={onToggleOptIn}
        />

        <div className="rounded-[1.45rem] border border-base-content/10 bg-base-content/[0.04] p-5">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
            Account state
          </p>
          <div className="mt-3 space-y-3 text-sm leading-6 text-base-content/72">
            <p>Email verification: {settings.emailVerified ? "Verified" : "Pending"}</p>
            <p>Reminder opt-in: {settings.emailOptIn ? "Enabled" : "Disabled"}</p>
            <p>Time zone: {settings.timeZone}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.45rem] border border-base-content/10 bg-base-content/[0.04] p-5">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
          How reminders work
        </p>
        <div className="mt-3 grid gap-3 lg:grid-cols-4">
          <div className="rounded-[1.1rem] border border-base-content/10 bg-base-content/[0.03] px-4 py-3">
            <p className="text-sm font-semibold text-base-content">1. Save clubs</p>
            <p className="mt-2 text-sm leading-6 text-base-content/64">
              Build the list of teams you want included in reminder emails.
            </p>
          </div>
          <div className="rounded-[1.1rem] border border-base-content/10 bg-base-content/[0.03] px-4 py-3">
            <p className="text-sm font-semibold text-base-content">2. Enable reminders</p>
            <p className="mt-2 text-sm leading-6 text-base-content/64">
              This stores the account preference the backend uses for reminder delivery.
            </p>
          </div>
          <div className="rounded-[1.1rem] border border-base-content/10 bg-base-content/[0.03] px-4 py-3">
            <p className="text-sm font-semibold text-base-content">3. Send now</p>
            <p className="mt-2 text-sm leading-6 text-base-content/64">
              You can manually send the current fixture digest right away from this page.
            </p>
          </div>
          <div className="rounded-[1.1rem] border border-base-content/10 bg-base-content/[0.03] px-4 py-3">
            <p className="text-sm font-semibold text-base-content">4. Future-ready</p>
            <p className="mt-2 text-sm leading-6 text-base-content/64">
              The same opt-in can support scheduled reminder sending later without changing your preference.
            </p>
          </div>
        </div>
      </div>

      <SendFixtureEmailButton
        disabled={!settings.emailVerified || !settings.emailOptIn}
        pending={sendPending}
        helperText={getFixtureEmailHelper(settings)}
        onSend={onSendFixtureEmail}
      />
    </div>
  );
}
