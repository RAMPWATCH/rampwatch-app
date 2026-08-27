import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const baseClass =
    "relative inline-flex items-center justify-center px-4 py-2.5 font-medium text-sm rounded-md transition-all duration-200 overflow-hidden active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent-primary text-bg-primary hover:bg-border-active",
    secondary: "bg-bg-secondary text-text-primary hover:bg-bg-elevated",
    outline:
      "border border-border-subtle text-text-primary hover:border-border-active bg-transparent",
  };

  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className || ""}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {/* Ripple effect overlay */}
      <span
        className="absolute inset-0 bg-white opacity-0 group-active:animate-ripple"
        aria-hidden="true"
      />
    </button>
  );
}
