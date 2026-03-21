import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/page-container";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  asideTitle?: string;
  asideDescription?: string;
  highlights: Array<{
    label: string;
    value: string;
    note: string;
  }>;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  asideTitle,
  asideDescription,
  highlights,
}: AuthPageShellProps) {
  return (
    <PageContainer className="gap-6 py-6 md:gap-8 md:py-8 lg:py-10">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(22rem,1fr)] xl:items-start">
        <div className="order-2 max-w-xl space-y-5 xl:order-1 xl:pt-4">
          <div className="space-y-3">
            <p className="section-kicker">{eyebrow}</p>
            <h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-base-content sm:text-[2.45rem]">
              {title}
            </h1>
            <p className="max-w-lg text-sm leading-6 text-base-content/70 sm:text-base">
              {description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.4rem] border border-base-content/10 bg-base-content/[0.04] px-4 py-4"
              >
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                  {item.label}
                </p>
                <p className="mt-2 text-base font-semibold text-base-content">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-base-content/68">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 space-y-4 xl:order-2 xl:justify-self-end xl:w-full xl:max-w-xl">
          {children}

          {asideTitle && asideDescription ? (
            <div className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
              <div className="space-y-2">
                <p className="section-kicker">Inside the product</p>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-base-content">
                  {asideTitle}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-base-content/70">
                  {asideDescription}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.45rem] border border-base-content/10 bg-base-content/[0.05] p-4">
                  <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                    What you see
                  </p>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-base-content/80">
                    <p>Recent form snapshots</p>
                    <p>Upcoming fixture context</p>
                    <p>Trend movement over time</p>
                  </div>
                </div>

                <div className="rounded-[1.45rem] border border-base-content/10 bg-base-content/[0.05] p-4">
                  <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                    Why it helps
                  </p>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-base-content/80">
                    <p>Follow favorite clubs faster</p>
                    <p>Read fixture runs more clearly</p>
                    <p>Keep the dashboard easy to scan</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </PageContainer>
  );
}