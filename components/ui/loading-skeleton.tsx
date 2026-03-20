import type { HTMLAttributes } from "react";

export function LoadingSkeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`skeleton ${className}`.trim()} {...props} />;
}
