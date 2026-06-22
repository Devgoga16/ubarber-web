import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useWhatsAppStatus } from "../../hooks/useWhatsApp";
import { useAuthStore } from "../../store/auth";
import { cn } from "../../lib/utils";

const statusLabels = {
  connected: "WhatsApp conectado",
  connecting: "Conectando WhatsApp...",
  disconnected: "WhatsApp desconectado",
};

const statusDotColors = {
  connected: "bg-success",
  connecting: "bg-warning",
  disconnected: "bg-danger",
};

export function WhatsAppStatusBadge({ dark = true }: { dark?: boolean }) {
  const { data } = useWhatsAppStatus();
  const role = useAuthStore((state) => state.user?.role);
  const status = data?.status ?? "disconnected";
  const canManage = role === "owner" || role === "manager";

  const content = (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-3 py-2",
        dark ? "border-white/10 bg-white/5" : "border-border bg-surface"
      )}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {status === "connected" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        )}
        <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", statusDotColors[status])} />
      </span>
      <MessageCircle className={cn("h-4 w-4", dark ? "text-primary-foreground/60" : "text-muted-foreground")} />
      <span
        className={cn(
          "truncate text-xs font-medium",
          dark ? "text-primary-foreground/80" : "text-foreground/80"
        )}
      >
        {statusLabels[status]}
      </span>
    </div>
  );

  if (!canManage) {
    return content;
  }

  return <Link to="/whatsapp">{content}</Link>;
}
