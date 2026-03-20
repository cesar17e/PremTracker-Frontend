import type { HTMLAttributes, ReactNode } from "react";

type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function PageContainer({
  children,
  className = "",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
