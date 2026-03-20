import type { ReactNode } from "react";

type StatusAlertProps = {
  title: string;
  description?: string;
  variant?: "info" | "success" | "warning" | "error";
  actions?: ReactNode;
};

const toneClassMap = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
} as const;

export function StatusAlert({
  title,
  description,
  variant = "info",
  actions,
}: StatusAlertProps) {
  return (
    <div className={`alert ${toneClassMap[variant]} items-start rounded-[1.5rem] shadow-sm`}>
      <div className="space-y-2">
        <h2 className="font-semibold tracking-[-0.02em]">{title}</h2>
        {description ? <p className="text-sm leading-6 opacity-85">{description}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
