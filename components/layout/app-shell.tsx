import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/teams", label: "Teams" },
  { href: "/favorites", label: "Favorites" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[92rem] flex-col px-4 pb-8 pt-4 md:px-6 lg:flex-row lg:gap-6 lg:px-8">
        <aside className="surface-card mb-6 flex rounded-[2rem] border border-base-content/10 p-4 lg:sticky lg:top-6 lg:mb-0 lg:h-[calc(100vh-3rem)] lg:w-72 lg:flex-col lg:p-5">
          <div className="flex flex-1 items-center justify-between gap-4 lg:flex-col lg:items-start lg:justify-start">
            <Link href="/" className="space-y-2">
              <p className="section-kicker">PremTracker</p>
              <p className="text-2xl font-semibold tracking-[-0.03em] text-base-content">
                EPL dashboard
              </p>
            </Link>

            <nav className="hidden w-full space-y-2 lg:block">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-base-content/72 transition hover:bg-base-100/80 hover:text-base-content"
                >
                  <span>{item.label}</span>
                  <span className="badge badge-ghost badge-sm">Soon</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex min-h-[60vh] flex-1 flex-col">
          <div className="surface-card flex flex-1 items-center justify-center rounded-[2rem] border border-base-content/10 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
