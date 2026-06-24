import { NavLink, Outlet } from "react-router-dom";
import {
  CalendarDays,
  Scissors,
  Users,
  MapPin,
  ShieldCheck,
  LogOut,
  Tag,
  Clock,
  LayoutDashboard,
  AlertTriangle,
  Wallet,
  CreditCard,
  MessageCircle,
  Link as LinkIcon,
  ShieldHalf,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/auth";
import { useSubscriptionGateStore } from "../../store/subscriptionGate";
import { PlanCard } from "./PlanCard";
import { LocationSwitcher } from "./LocationSwitcher";
import { WhatsAppStatusBadge } from "./WhatsAppStatusBadge";
import { Button } from "../ui/Button";

interface NavItem {
  to: string;
  label: string;
  icon: typeof CalendarDays;
  mobile?: boolean;
}

const ownerNavItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/", label: "Agenda", icon: CalendarDays },
  { to: "/caja", label: "Caja", icon: Wallet },
  { to: "/metodos-de-pago", label: "Métodos de pago", icon: CreditCard, mobile: false },
  { to: "/sedes", label: "Sedes", icon: MapPin },
  { to: "/barberos", label: "Barberos", icon: Scissors },
  { to: "/clientes", label: "Clientes", icon: Users, mobile: false },
  { to: "/servicios", label: "Servicios", icon: Tag, mobile: false },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle, mobile: false },
  { to: "/enlace-de-reservas", label: "Enlace de reservas", icon: LinkIcon, mobile: false },
  { to: "/adelantos", label: "Adelantos", icon: ShieldHalf, mobile: false },
];

// El barbero solo ve su propia agenda y su propio horario — nada de gestión del negocio.
const barberNavItems: NavItem[] = [
  { to: "/", label: "Mi agenda", icon: CalendarDays },
  { to: "/mi-horario", label: "Mi horario", icon: Clock },
];

const adminNavItems: NavItem[] = [
  { to: "/admin", label: "Negocios", icon: ShieldCheck },
  { to: "/admin/pagos", label: "Pagos", icon: CreditCard },
];

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const subscriptionBlocked = useSubscriptionGateStore((state) => state.blocked);
  const subscriptionMessage = useSubscriptionGateStore((state) => state.message);
  const clearSubscriptionBlock = useSubscriptionGateStore((state) => state.clear);

  const navItems =
    user?.role === "super_admin"
      ? adminNavItems
      : user?.role === "barber"
        ? barberNavItems
        : ownerNavItems;

  if (subscriptionBlocked && user?.role !== "super_admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/15">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <h1 className="font-heading mb-2 text-lg font-semibold text-primary">
            Tu suscripción no está activa
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {subscriptionMessage ??
              "No puedes seguir usando uBarber hasta que se reactive tu suscripción. Si crees que esto es un error, contacta a soporte."}
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              Reintentar
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                clearSubscriptionBlock();
                logout();
              }}
              className="w-full"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="gradient-primary hidden w-64 flex-col p-4 lg:flex">
        <div className="mb-6 flex items-center gap-2.5 px-2 pt-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent shadow-soft">
            <Scissors className="h-5 w-5 text-accent-foreground" />
          </div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-primary-foreground">
            uBarber
          </h1>
        </div>
        {(user?.role === "owner" || user?.role === "manager") && <LocationSwitcher dark />}
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/55 transition-colors hover:bg-white/5 hover:text-primary-foreground/90",
                  isActive && "bg-white/10 text-primary-foreground"
                )
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent-soft" />
                  )}
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4">
          {(user?.role === "owner" || user?.role === "manager") && <PlanCard />}
          {user?.role !== "super_admin" && (
            <div className="mb-3">
              <WhatsAppStatusBadge />
            </div>
          )}
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-primary-foreground">{user?.name}</p>
              <p className="truncate text-xs capitalize text-primary-foreground/50">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-foreground/55 transition-colors hover:bg-white/5 hover:text-primary-foreground/90"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 lg:hidden">
          <h1 className="font-heading text-lg font-semibold text-primary">uBarber</h1>
          <button onClick={logout} className="text-sm text-muted-foreground">
            Salir
          </button>
        </header>

        <main className="p-4 pb-24 sm:p-6 lg:pb-6">
          {(user?.role === "owner" || user?.role === "manager") && (
            <div className="lg:hidden">
              <LocationSwitcher />
            </div>
          )}
          {user?.role !== "super_admin" && (
            <div className="mb-4 lg:hidden">
              <WhatsAppStatusBadge dark={false} />
            </div>
          )}
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 flex border-t border-border bg-background lg:hidden">
          {navItems.filter((item) => item.mobile !== false).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground",
                  isActive && "text-accent"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
