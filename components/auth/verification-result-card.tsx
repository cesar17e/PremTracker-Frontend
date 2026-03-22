import type { ReactNode } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";

type VerificationResultCardProps = {
  status: "success" | "error" | "info";
  title: string;
  description: string;
  actions?: ReactNode;
  footerLinkHref?: string;
  footerLinkLabel?: string;
};

function getEyebrow(status: VerificationResultCardProps["status"]) {
  if (status === "success") return "Complete";
  if (status === "error") return "Needs attention";
  return "Recovery";
}

export function VerificationResultCard({
  status,
  title,
  description,
  actions,
  footerLinkHref,
  footerLinkLabel,
}: VerificationResultCardProps) {
  return (
    <AuthCard title={title} description={description}>
      <div className="space-y-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            status === "success"
              ? "bg-primary/14 text-primary"
              : status === "error"
              ? "bg-error/14 text-error"
              : "bg-base-content/[0.08] text-base-content/78"
          }`}
        >
          {getEyebrow(status)}
        </span>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}

        {footerLinkHref && footerLinkLabel ? (
          <Link
            href={footerLinkHref}
            className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {footerLinkLabel}
          </Link>
        ) : null}
      </div>
    </AuthCard>
  );
}
