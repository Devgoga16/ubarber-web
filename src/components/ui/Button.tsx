import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { Spinner } from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

export function Button({ variant = "primary", loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-medium tracking-tight transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variant === "primary" &&
          "gradient-accent text-accent-foreground shadow-soft hover:brightness-110",
        variant === "secondary" &&
          "border border-border bg-background text-primary hover:bg-surface hover:border-accent/30",
        variant === "danger" && "bg-danger text-primary-foreground shadow-soft hover:bg-danger/90",
        className
      )}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
