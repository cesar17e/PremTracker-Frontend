import { EmptyState } from "@/components/ui/empty-state";

export default function TeamsPage() {
  return (
    <div className="w-full max-w-4xl space-y-5">
      <section className="rounded-[1.7rem] border border-base-content/10 bg-base-content/[0.04] p-5 sm:p-6">
        <p className="section-kicker">Teams workspace</p>
        <h1 className="mt-3 text-[1.95rem] font-semibold tracking-[-0.03em] text-base-content">
          Your dashboard shell is ready
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/70">
          Authentication is in place, the protected shell is stable, and this route is ready for the
          live Premier League team list in the next pass.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              label: "Session",
              title: "Restore on reload",
              copy: "Your login can persist through refresh using the backend refresh cookie.",
            },
            {
              label: "Shell",
              title: "Protected routing live",
              copy: "Authenticated pages now hold until the account session is resolved.",
            },
            {
              label: "Next",
              title: "Team list up next",
              copy: "The next implementation pass can focus on clubs, fixtures, and analytics.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[1.35rem] border border-base-content/10 bg-base-content/[0.05] p-4"
            >
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                {item.label}
              </p>
              <h2 className="mt-2.5 text-base font-semibold text-base-content">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-base-content/70">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <EmptyState
        eyebrow="Teams roadmap"
        title="Team analytics land in the next phase"
        description="This protected route is ready to swap in the real `/api/teams` integration without reworking the shell or auth flow."
      />
    </div>
  );
}
