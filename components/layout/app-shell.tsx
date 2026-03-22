"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/teams", label: "Teams" },
  { href: "/favorites", label: "Favorites" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, status } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[84rem] flex-col px-4 pb-6 pt-3 md:px-6 md:pb-8 md:pt-4 lg:flex-row lg:gap-4 lg:px-6">
        <aside className="surface-card mb-5 flex rounded-[1.9rem] border border-base-content/10 p-3.5 lg:sticky lg:top-5 lg:mb-0 lg:min-h-[calc(100vh-2.5rem)] lg:w-[16.25rem] lg:flex-col lg:p-4">
          <div className="flex flex-1 flex-col gap-3.5">
            <div className="space-y-3">
              <Link href="/" className="block space-y-2">
                <p className="section-kicker">PremTracker</p>
                <p className="text-[1.55rem] font-semibold tracking-[-0.03em] text-base-content">
                  EPL dashboard
                </p>
              </Link>

              <div className="flex justify-start">
                <ThemeToggle compact />
              </div>
            </div>

            <div className="rounded-[1.45rem] border border-base-content/10 bg-base-content/[0.04] p-4">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--subtle-text)]">
                Session
              </p>
              <p className="mt-2.5 text-sm font-semibold text-base-content">
                {user?.email ?? "Signed out"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="badge badge-soft rounded-full border-none bg-primary/14 px-3 text-primary">
                  {status === "authenticated" ? "Active session" : "Checking session"}
                </span>
                {user ? (
                  <span className="badge badge-outline rounded-full border-base-content/12 text-base-content/72">
                    {user.emailVerified ? "Email verified" : "Verification pending"}
                  </span>
                ) : null}
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1.5 lg:overflow-visible lg:pb-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-w-fit items-center justify-between rounded-[1.2rem] px-4 py-2.5 text-sm font-medium transition hover:bg-base-100/80 hover:text-base-content lg:min-w-0 ${
                    pathname === item.href
                      ? "bg-base-content/[0.08] text-base-content"
                      : "text-base-content/72"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto rounded-[1.45rem] border border-base-content/10 bg-base-content/[0.04] p-4">
              <p className="text-sm leading-6 text-base-content/68">
                Core account flow, saved clubs, and reminder settings now sit inside this shell.
              </p>
              <button
                type="button"
                className="btn btn-ghost mt-3 w-full rounded-full border border-base-content/10"
                onClick={async () => {
                  await logout();
                  router.replace("/login");
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-[60vh] flex-1 flex-col">
          <div className="surface-card flex flex-1 items-start rounded-[1.9rem] border border-base-content/10 p-4 sm:p-5 lg:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
