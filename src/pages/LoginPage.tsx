import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { useAuthStore } from "../store/auth";
import { useSubscriptionGateStore } from "../store/subscriptionGate";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const clearSubscriptionBlock = useSubscriptionGateStore((state) => state.clear);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      clearSubscriptionBlock();
      login(data.token, data.user);
      navigate(data.user.role === "super_admin" ? "/admin" : "/agenda");
    } catch {
      setError("Credenciales inválidas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <div className="gradient-primary relative hidden flex-1 flex-col justify-between overflow-hidden p-10 text-primary-foreground lg:flex">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(46,125,255,0.35), transparent 45%), radial-gradient(circle at 85% 85%, rgba(242,177,52,0.18), transparent 40%)",
          }}
        />
        <div className="relative flex animate-fade-up items-center gap-2.5">
          <img src="/logo-mark.png" alt="uBarber" className="h-9 w-9 object-contain" />
          <span className="font-heading text-xl font-semibold tracking-tight">uBarber</span>
        </div>
        <div className="relative animate-fade-up [animation-delay:0.1s]">
          <div className="mb-4 h-1 w-10 rounded-full bg-gold" />
          <p className="font-heading max-w-sm text-3xl font-medium leading-tight tracking-tight">
            Gestiona tu barbería, todas tus sedes y tu equipo desde un solo lugar.
          </p>
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/60">
            Agenda, barberos, clientes y caja — pensado para usarse desde el celular en el día a
            día del local.
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} uBarber
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-soft-lg sm:p-8"
        >
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <img src="/logo-mark.png" alt="uBarber" className="h-9 w-9 object-contain" />
            <span className="font-heading text-xl font-semibold tracking-tight text-primary">
              uBarber
            </span>
          </div>

          <h1 className="font-heading mb-1 text-2xl font-semibold tracking-tight text-primary">
            Bienvenido
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">Inicia sesión para continuar</p>

          <Field label="Correo">
            <Input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Contraseña">
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && <p className="mb-4 text-sm text-danger">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}
