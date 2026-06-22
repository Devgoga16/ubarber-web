import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="animate-modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-primary/50 backdrop-blur-sm sm:items-center">
      <div className="animate-modal-panel max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-background p-5 shadow-soft-lg sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-primary">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
