"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type MouseEvent, type ReactNode } from "react";

type PendingLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  pendingLabel?: string;
  replace?: boolean;
  title?: string;
};

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export function PendingLink({
  href,
  className = "",
  children,
  pendingLabel,
  replace = false,
  title,
}: PendingLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Link
      href={href}
      title={title}
      aria-disabled={isPending}
      aria-busy={isPending}
      className={`${className} ${isPending ? "pointer-events-none opacity-80" : ""}`.trim()}
      onClick={(event) => {
        if (isPending || isModifiedEvent(event) || event.defaultPrevented) {
          return;
        }

        event.preventDefault();
        startTransition(() => {
          if (replace) {
            router.replace(href);
            return;
          }

          router.push(href);
        });
      }}
    >
      <span className="inline-flex items-center gap-2">
        {isPending && !pendingLabel ? (
          <span className="loading loading-spinner loading-xs" aria-hidden="true" />
        ) : null}
        <span>{isPending && pendingLabel ? pendingLabel : children}</span>
        {isPending && pendingLabel ? (
          <span className="loading loading-spinner loading-xs" aria-hidden="true" />
        ) : null}
      </span>
    </Link>
  );
}
