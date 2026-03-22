import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Track Premier League clubs",
  description:
    "Track your favorite Premier League clubs with analytics you can actually understand.",
};

const productCards = [
  {
    title: "Understand current form quickly",
    body: "See how your club is playing right now with recent results and simple form context that does not need a spreadsheet.",
  },
  {
    title: "Plan around the next run of fixtures",
    body: "Check what is coming next, spot difficult stretches early, and keep matchweek decisions grounded in context.",
  },
  {
    title: "Follow trends without extra noise",
    body: "Track momentum over time with clean, readable views that stay focused on useful Premier League patterns.",
  },
];

const previewStats = [
  { label: "Form", value: "Readable snapshots", copy: "See where a club stands right now" },
  { label: "Fixtures", value: "Next run at a glance", copy: "Plan around the upcoming schedule" },
  { label: "Trends", value: "Momentum over time", copy: "Understand direction, not just single results" },
  { label: "Favorites", value: "Clubs you follow", copy: "Keep the experience focused and personal" },
];

export default function LandingPage() {
  return (
    <PageContainer className="gap-10 py-8 md:gap-12 md:py-10 lg:py-12">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start xl:gap-10">
        <div className="max-w-2xl space-y-7">
          <div className="space-y-4">
            <p className="section-kicker">Analytics product for EPL supporters</p>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-balance text-base-content sm:text-4xl lg:text-[2.85rem]">
              PremTracker - Track your favorite Premier League clubs with analytics you can actually understand
            </h1>
            <p className="max-w-2xl text-base leading-7 text-base-content/70 sm:text-lg">
              Check form, scan upcoming fixtures, follow trends over time, and keep your favorite
              clubs close without digging through cluttered dashboards.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/register" className="btn btn-primary rounded-full px-6">
              Create account
            </Link>
            <Link href="/login" className="btn btn-ghost rounded-full border border-base-content/10 px-6 text-base-content/80">
              Log in
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {previewStats.map((item) => (
              <div
                key={item.label}
                className="surface-card rounded-2xl p-5"
              >
                <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                  {item.label}
                </p>
                <p className="mt-3 text-lg font-semibold text-base-content">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-base-content/70">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:max-w-2xl lg:justify-self-end">
          <div className="glass-panel pitch-grid rounded-2xl p-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-base-content/[0.04] px-4 py-3">
                <div>
                  <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                    Product preview
                  </p>
                  <p className="mt-1 text-base font-semibold text-base-content">
                    Your clubs, one clear dashboard
                  </p>
                </div>
                <span className="badge badge-soft rounded-full border-none bg-primary/14 px-3 text-primary">
                  Premier League focus
                </span>
              </div>

              <div className="surface-card rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                      Arsenal
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-base-content">
                      Good form
                    </p>
                    <p className="mt-2 text-sm leading-6 text-base-content/70">
                      A quick read on recent performances, with enough detail to make the view useful.
                    </p>
                  </div>
                  <div className="inline-flex shrink-0 flex-nowrap items-center gap-1 rounded-full border border-primary/25 bg-primary/8 px-3 py-2 text-xs font-medium tracking-[0.2em] text-primary">
                    <span>W</span>
                    <span>W</span>
                    <span>D</span>
                    <span>L</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-base-content/[0.04] p-4">
                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                      Form
                    </p>
                    <p className="mt-2 text-lg font-semibold text-base-content">Strong run</p>
                  </div>
                  <div className="rounded-2xl bg-base-content/[0.04] p-4">
                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                      Fixtures
                    </p>
                    <p className="mt-2 text-lg font-semibold text-base-content">2 tough next</p>
                  </div>
                  <div className="rounded-2xl bg-base-content/[0.04] p-4">
                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                      Trend
                    </p>
                    <p className="mt-2 text-lg font-semibold text-base-content">Upward</p>
                  </div>
                  <div className="rounded-2xl bg-base-content/[0.04] p-4">
                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                      Saved
                    </p>
                    <p className="mt-2 text-lg font-semibold text-base-content">3 clubs</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.82fr)]">
                <div className="surface-card rounded-2xl p-5">
                  <div>
                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                      Upcoming fixtures
                    </p>
                    <p className="mt-1 text-base font-semibold text-base-content">
                      Next up for your saved clubs
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      { club: "Arsenal", fixture: "vs Newcastle", note: "Home fixture, manageable run" },
                      { club: "Liverpool", fixture: "at Tottenham", note: "Tougher away test" },
                      { club: "Brighton", fixture: "vs Brentford", note: "Good chance to build momentum" },
                    ].map((item) => (
                      <div
                        key={`${item.club}-${item.fixture}`}
                        className="rounded-2xl bg-base-content/[0.04] px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-base-content">{item.club}</p>
                            <p className="mt-1 text-sm text-base-content/78">{item.fixture}</p>
                          </div>
                          <span className="badge badge-outline rounded-full border-primary/20 text-primary">
                            Next
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-base-content/60">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-card rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">Trend snapshot</p>
                    <span className="text-sm text-primary">Improving</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[62, 74, 81].map((value, index) => (
                      <div key={value} className="space-y-2">
                        <div className="flex items-center justify-between text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                        
                          <span>Window {index + 1}</span>
                          <span>{value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-base-content/10">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {productCards.map((card) => (
          <article key={card.title} className="surface-card rounded-2xl p-6">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">Product focus</p>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-base-content">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-base-content/70">{card.body}</p>
          </article>
        ))}
      </section>
    </PageContainer>
  );
}
