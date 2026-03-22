import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PendingLink } from "@/components/ui/pending-link";

const navItems = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Create account" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30">
      <PageContainer className="pt-3 sm:pt-4">
        <div className="glass-panel flex flex-col gap-3 rounded-[2rem] border border-base-content/10 px-3 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.22)] sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:px-5 md:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/16 text-sm font-semibold text-primary">
              PT
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--subtle-text)]">
                PremTracker
              </p>
              <p className="text-sm text-[color:var(--muted-text)] sm:hidden">
                EPL analytics
              </p>
              <p className="hidden text-sm text-[color:var(--muted-text)] sm:block">
                Premier League club analytics
              </p>
            </div>
          </Link>

          <nav className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
            <ThemeToggle compact />
            {navItems.map((item) => (
              <PendingLink
                key={item.href}
                href={item.href}
                pendingLabel={item.label === "Create account" ? "Opening..." : "Opening..."}
                className={
                  item.href === "/register"
                    ? "btn btn-primary min-h-10 rounded-full px-4 text-sm sm:px-5"
                    : "btn btn-ghost min-h-10 rounded-full border border-base-content/10 px-4 text-sm text-base-content/76 sm:px-5"
                }
              >
                {item.label}
              </PendingLink>
            ))}
          </nav>
        </div>
      </PageContainer>
    </header>
  );
}
