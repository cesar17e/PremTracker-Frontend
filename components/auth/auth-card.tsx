import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="surface-card rounded-[1.9rem] p-4 sm:p-6">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-primary">
        Account
      </p>
      <h1 className="mt-3 text-[1.85rem] font-semibold tracking-[-0.03em] text-base-content sm:text-[1.9rem]">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-base-content/70">
        {description}
      </p>

      <div className="mt-6">{children}</div>

      {footer ? <div className="mt-5 border-t border-base-content/10 pt-4">{footer}</div> : null}
    </div>
  );
}
