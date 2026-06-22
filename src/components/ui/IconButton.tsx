import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "danger";
}

export function IconButton({ variant = "default", className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors",
        "hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        variant === "danger" && "hover:bg-danger/10 hover:text-danger",
        className
      )}
    />
  );
}
