import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navItems = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Create account" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30">
      <PageContainer className="pt-4">
        <div className="glass-panel flex items-center justify-between rounded-full border border-base-content/10 px-4 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.22)] md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/16 text-sm font-semibold text-primary">
              PT
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--subtle-text)]">
                PremTracker
              </p>
              <p className="text-sm text-[color:var(--muted-text)]">
                Premier League club analytics
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <ThemeToggle />
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.href === "/register"
                    ? "btn btn-primary rounded-full px-5"
                    : "btn btn-ghost rounded-full border border-base-content/10 px-5 text-base-content/76"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </PageContainer>
    </header>
  );
}
