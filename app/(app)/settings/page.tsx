import { EmptyState } from "@/components/ui/empty-state";

export default function SettingsPage() {
  return (
    <div className="w-full max-w-3xl space-y-5">
      <section className="rounded-[1.7rem] border border-base-content/10 bg-base-content/[0.04] p-5 sm:p-6">
        <p className="section-kicker">Settings</p>
        <h1 className="mt-3 text-[1.85rem] font-semibold tracking-[-0.03em] text-base-content">
          Account controls are staged for the next pass
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/70">
          Email verification, reminder preferences, and other account controls can now sit on top of
          the working session layer already in place.
        </p>
      </section>

      <EmptyState
        eyebrow="Coming next"
        title="Settings are reserved for the next account pass"
        description="Phase 2 establishes login, registration, session restore, and logout. Email verification and reminder settings get added after the core routes are stable."
      />
    </div>
  );
}
