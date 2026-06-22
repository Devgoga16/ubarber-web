import { cn } from "../../lib/utils";

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-9 w-9",
};

interface SpinnerProps {
  size?: keyof typeof sizeClasses;
  className?: string;
}

/** Tijera animada usada como loader en toda la app (botones, páginas, listas). */
export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(sizeClasses[size], className)}
      role="status"
      aria-label="Cargando"
    >
      <g className="scissor-blade scissor-blade-top">
        <circle cx="6" cy="6" r="3" />
        <path d="M6 6 L12 12 L20 4" />
      </g>
      <g className="scissor-blade scissor-blade-bottom">
        <circle cx="6" cy="18" r="3" />
        <path d="M6 18 L12 12 L20 20" />
      </g>
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
