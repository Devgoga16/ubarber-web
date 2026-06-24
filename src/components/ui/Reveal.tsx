import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Envuelve contenido y lo anima al entrar en pantalla (fade + slide-up); se repite cada vez que vuelve a entrar. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
