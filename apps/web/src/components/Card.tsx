import { ReactNode } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  const baseClass =
    "rounded-lg border border-border-subtle bg-bg-secondary transition-all duration-200 hover:border-border-active hover:-translate-y-0.5";

  return (
    <div className={`${baseClass} ${className || ""}`} {...props}>
      {children}
    </div>
  );
}
