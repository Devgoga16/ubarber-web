import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Scissors,
  CalendarDays,
  Wallet,
  MessageCircle,
  ShieldCheck,
  MapPin,
  CreditCard,
  Clock,
  Link as LinkIcon,
  CheckCircle2,
  Smartphone,
  Percent,
  Star,
  X,
  Camera,
  ClipboardCheck,
  PlayCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Reveal } from "../components/ui/Reveal";
import { cn } from "../lib/utils";
import { formatCurrency } from "../lib/format";
import { usePublicPlans } from "../hooks/usePublicPlans";

// TODO: reemplaza este número por el WhatsApp real de ventas (formato 51XXXXXXXXX, sin "+").
const SALES_WHATSAPP = "51955768897";
const salesWhatsappUrl = `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(
  "Hola, quiero información sobre uBarber para mi barbería"
)}`;

function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-10 border-b backdrop-blur transition-shadow duration-300",
        scrolled ? "border-border bg-background/80 shadow-soft" : "border-transparent bg-background/0"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo-mark.png" alt="uBarber" className="h-8 w-8 object-contain" />
          <span className="font-heading text-lg font-semibold tracking-tight text-primary">uBarber</span>
        </div>
        <div className="flex items-center gap-2">
          <a href="#planes" className="hidden text-sm font-medium text-muted-foreground hover:text-primary sm:block">
            Planes
          </a>
          <Link to="/login">
            <Button variant="secondary" className="px-4 py-2 text-sm">
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="gradient-primary relative overflow-hidden text-primary-foreground">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(46,125,255,0.35), transparent 45%), radial-gradient(circle at 85% 85%, rgba(242,177,52,0.18), transparent 40%)",
        }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
        <img
          src="/logo-mark.png"
          alt="uBarber"
          className="h-16 w-16 animate-hero-pop object-contain sm:h-20 sm:w-20"
        />
        <span className="animate-fade-up rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-primary-foreground/80 [animation-delay:0.05s]">
          Software para barberías y salones
        </span>
        <h1 className="font-heading max-w-2xl animate-fade-up text-3xl font-semibold leading-tight tracking-tight [animation-delay:0.1s] sm:text-5xl">
          Toda tu barbería, organizada desde el celular
        </h1>
        <p className="max-w-xl animate-fade-up text-base text-primary-foreground/70 [animation-delay:0.18s] sm:text-lg">
          Agenda online, recordatorios por WhatsApp, control de caja, comisiones de tus barberos y
          reservas 24/7 para tus clientes — todo en un solo lugar.
        </p>
        <div className="flex w-full max-w-xs animate-fade-up flex-col gap-3 [animation-delay:0.26s] sm:w-auto sm:max-w-none sm:flex-row">
          <a href={salesWhatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button className="hover-lift w-full px-6 py-3 text-base sm:w-auto">Quiero probarlo</Button>
          </a>
          <a href="#como-funciona" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              className="hover-lift w-full border-white/20 bg-white/5 px-6 py-3 text-base text-primary-foreground hover:bg-white/10 sm:w-auto"
            >
              Ver cómo funciona
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

interface AudienceCardProps {
  icon: typeof CalendarDays;
  title: string;
  description: string;
  items: string[];
}

function AudienceCard({ icon: Icon, title, description, items }: AudienceCardProps) {
  return (
    <div className="hover-lift flex h-full flex-col items-center gap-4 rounded-2xl border border-border bg-background p-6 text-center shadow-soft hover:shadow-soft-lg sm:items-start sm:text-left">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-accent shadow-soft">
        <Icon className="h-5 w-5 text-accent-foreground" />
      </div>
      <div>
        <h3 className="font-heading text-lg font-semibold tracking-tight text-primary">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="flex w-full flex-col gap-2 text-left">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-primary">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Audiences() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal className="mb-10 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          Hecho para los tres lados del negocio
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Dueños, barberos y clientes usan uBarber todos los días, cada uno desde su propia vista.
        </p>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-3">
        <Reveal className="h-full">
          <AudienceCard
            icon={ShieldCheck}
            title="Para dueños"
            description="Controla tu negocio sin estar siempre encima."
            items={[
              "Agenda de todas tus sedes y barberos en un calendario",
              "Caja diaria: qué se cobró, con qué método y quién atendió",
              "Adelantos/depósitos configurables para evitar citas fantasma",
              "Recordatorios automáticos por WhatsApp a tus clientes",
              "Link de reservas propio para compartir en redes",
              "Dashboard con ingresos, servicios populares y citas del día",
            ]}
          />
        </Reveal>
        <Reveal delay={100} className="h-full">
          <AudienceCard
            icon={Scissors}
            title="Para barberos"
            description="Su propia agenda, sin depender de papelitos ni mensajes sueltos."
            items={[
              "Agenda personal con sus citas del día",
              "Configura su propio horario por sede",
              "Recibe nuevas solicitudes y confirma o rechaza con un link, sin apps raras",
              "Ve sus comisiones por servicio atendido",
              "Notificaciones automáticas por WhatsApp de cada cita nueva",
            ]}
          />
        </Reveal>
        <Reveal delay={200} className="h-full">
          <AudienceCard
            icon={Smartphone}
            title="Para clientes"
            description="Reservar una cita debería tomar 1 minuto, no una llamada."
            items={[
              "Reserva online 24/7 desde el celular, sin descargar nada",
              "Elige sede, barbero, servicio y horario disponible al instante",
              "Confirmación y recordatorio automático por WhatsApp",
              "Pago de adelanto simple (comprobante o código de confianza)",
              "Sabe de inmediato si su cita quedó confirmada",
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}

function FeatureRow({ icon: Icon, title, description }: { icon: typeof CalendarDays; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-1 text-center sm:flex-row sm:items-start sm:gap-3 sm:px-0 sm:text-left">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-primary sm:text-base">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground sm:mt-0 sm:text-sm">{description}</p>
      </div>
    </div>
  );
}

const featureItems: { icon: typeof CalendarDays; title: string; description: string }[] = [
  { icon: CalendarDays, title: "Agenda inteligente", description: "Evita choques de horario por barbero y por sede automáticamente." },
  { icon: MapPin, title: "Multi-sede", description: "Maneja varios locales desde una sola cuenta, sin mezclarlos." },
  { icon: Wallet, title: "Caja del día", description: "Ve cuánto se cobró, cómo y quién atendió cada cita." },
  { icon: CreditCard, title: "Adelantos y métodos de pago", description: "Pide depósito antes de la cita para reducir las que no se presentan." },
  { icon: MessageCircle, title: "WhatsApp automático", description: "Recordatorios y confirmaciones sin que nadie tenga que escribir manualmente." },
  { icon: LinkIcon, title: "Link de reservas", description: "Tu propia página de reservas para compartir en Instagram o WhatsApp." },
  { icon: Clock, title: "Horarios por barbero", description: "Cada barbero define su disponibilidad real por sede y día." },
  { icon: Percent, title: "Comisiones", description: "Define el porcentaje de comisión de cada barbero por servicio." },
  { icon: ShieldCheck, title: "Roles y permisos", description: "Dueño, encargado y barbero ven solo lo que les corresponde." },
];

function Features() {
  return (
    <section id="funciones" className="bg-surface py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            No necesitas más herramientas, aquí lo tienes todo
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {featureItems.map((item, index) => (
            <Reveal key={item.title} delay={(index % 3) * 80}>
              <FeatureRow icon={item.icon} title={item.title} description={item.description} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

interface TimelineStep {
  icon: typeof CalendarDays;
  who: string;
  title: string;
  description: string;
}

const clientFlowSteps: TimelineStep[] = [
  {
    icon: Smartphone,
    who: "Cliente",
    title: "Abre el link de reservas",
    description: "Elige sede, servicio y barbero — puede ver su foto, calificación y comentarios de otros clientes.",
  },
  {
    icon: CalendarDays,
    who: "Cliente",
    title: "Elige fecha y hora disponible",
    description: "Solo ve horarios reales según el turno del barbero, sin choques ni dobles citas.",
  },
  {
    icon: Camera,
    who: "Cliente",
    title: "Paga el adelanto (si aplica)",
    description: "Sube el comprobante con el método que usó, o escribe el código de confianza si ya es cliente conocido.",
  },
  {
    icon: CheckCircle2,
    who: "Negocio",
    title: "El barbero confirma disponibilidad",
    description: "Y si subió comprobante, el dueño lo revisa antes de dejar la cita en firme.",
  },
  {
    icon: MessageCircle,
    who: "Automático",
    title: "Recibe confirmación y recordatorio",
    description: "Aviso por WhatsApp en cada paso, y un recordatorio automático 1 hora antes de su cita.",
  },
  {
    icon: Star,
    who: "Cliente",
    title: "Califica su atención",
    description: "Al finalizar, recibe el resumen del pago y un link personal de un solo uso para calificar al barbero.",
  },
];

const businessFlowSteps: TimelineStep[] = [
  {
    icon: CalendarDays,
    who: "Cliente o negocio",
    title: "Se registra la cita",
    description: "El cliente reserva sola por el link, o el barbero/dueño la agenda directo en la app.",
  },
  {
    icon: CheckCircle2,
    who: "Barbero",
    title: "Confirma disponibilidad (si pidió adelanto)",
    description: "Responde \"SI\" por WhatsApp o lo confirma en la app — sin tener que llamar a nadie.",
  },
  {
    icon: ClipboardCheck,
    who: "Dueño",
    title: "Revisa el comprobante (si aplica)",
    description: "Si el cliente subió foto del adelanto, el dueño la revisa en la app y deja la cita en firme.",
  },
  {
    icon: PlayCircle,
    who: "Barbero",
    title: "Brinda el servicio",
    description: "Marca la cita como \"en atención\" al empezar, y \"finalizada\" al terminar.",
  },
  {
    icon: CreditCard,
    who: "Barbero",
    title: "Registra el pago",
    description: "Elige el método usado y, si quiere, adjunta foto del comprobante final.",
  },
  {
    icon: Star,
    who: "Automático",
    title: "El cliente califica el servicio",
    description: "Le llega por WhatsApp un link personal y de un solo uso para calificar al barbero.",
  },
];

const STEP_DURATION_MS = 3200;

function Timeline({ steps }: { steps: TimelineStep[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [steps]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % steps.length);
    }, STEP_DURATION_MS);
    return () => clearInterval(id);
  }, [steps, paused]);

  const activeStep = steps[activeIndex];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Riel horizontal de pasos */}
      <div className="relative overflow-x-auto pb-2">
        <div className="relative flex min-w-max items-center gap-0 px-1 sm:min-w-0 sm:justify-between">
          <div className="absolute left-5 right-5 top-5 h-0.5 bg-border" />
          <div
            className="absolute left-5 top-5 h-0.5 bg-accent transition-all duration-500 ease-out"
            style={{
              width: steps.length > 1 ? `calc((100% - 2.5rem) * ${activeIndex / (steps.length - 1)})` : 0,
            }}
          />
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            const isDone = index < activeIndex;
            return (
              <button
                key={step.title}
                onClick={() => setActiveIndex(index)}
                className="relative z-10 flex w-20 flex-shrink-0 flex-col items-center gap-2 sm:w-auto sm:flex-1"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background shadow-soft transition-all duration-300",
                    isActive
                      ? "scale-110 border-accent gradient-accent text-accent-foreground"
                      : isDone
                        ? "border-accent text-accent"
                        : "border-border text-muted-foreground"
                  )}
                >
                  <step.icon className="h-4.5 w-4.5" />
                </span>
                <span
                  className={cn(
                    "text-center text-[11px] font-medium leading-tight transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel con el contenido del paso activo */}
      <div className="relative mt-8 overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-soft sm:p-8">
        <span className="pointer-events-none absolute -right-2 -top-6 font-heading text-[90px] font-bold text-accent/5 sm:text-[120px]">
          {activeIndex + 1}
        </span>
        <div key={activeIndex} className="relative animate-fade-up flex flex-col items-center gap-3 text-center">
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            {activeStep.who}
          </span>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent shadow-soft">
            <activeStep.icon className="h-7 w-7 text-accent-foreground" />
          </div>
          <p className="font-heading text-lg font-semibold text-primary">{activeStep.title}</p>
          <p className="max-w-md text-sm text-muted-foreground">{activeStep.description}</p>
        </div>

        <div className="mx-auto mt-6 flex w-fit gap-1.5">
          {steps.map((step, index) => (
            <button
              key={step.title}
              onClick={() => setActiveIndex(index)}
              aria-label={`Ir al paso ${index + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === activeIndex ? "w-6 bg-accent" : "w-1.5 bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailedHowItWorks() {
  const [tab, setTab] = useState<"client" | "business">("client");

  return (
    <section id="como-funciona" className="bg-surface py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal className="mb-8 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            ¿Cómo funciona uBarber?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Mira el paso a paso desde el lado que te interesa.
          </p>
        </Reveal>

        <Reveal className="mx-auto mb-10 flex w-fit gap-1 rounded-lg bg-background p-1 shadow-soft">
          <button
            onClick={() => setTab("client")}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === "client" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-primary"
            )}
          >
            Como cliente
          </button>
          <button
            onClick={() => setTab("business")}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === "business" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-primary"
            )}
          >
            Como negocio
          </button>
        </Reveal>

        <Timeline key={tab} steps={tab === "client" ? clientFlowSteps : businessFlowSteps} />
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Creamos tu cuenta", description: "Configuramos tu negocio, sedes y barberos en minutos." },
    { title: "Comparte tu link de reservas", description: "Tus clientes reservan solos, sin llamarte ni escribirte." },
    { title: "Gestiona todo desde el celular", description: "Agenda, caja y WhatsApp automático desde el día uno." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal className="mb-10 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          Empezar toma menos de un día
        </h2>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal key={step.title} delay={index * 120}>
            <div className="hover-lift flex flex-col items-center rounded-2xl border border-border bg-background p-6 text-center shadow-soft hover:shadow-soft-lg sm:items-start sm:text-left">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full gradient-accent text-sm font-semibold text-accent-foreground">
                {index + 1}
              </div>
              <p className="font-heading font-semibold text-primary">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const { data: plans, isLoading } = usePublicPlans();

  return (
    <section id="planes" className="bg-surface py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Planes simples, sin letra chica
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Elige el plan según el tamaño de tu barbería. Puedes cambiarlo cuando quieras.
          </p>
        </Reveal>

        {isLoading && (
          <div className="flex justify-center py-8 text-accent">
            <Spinner />
          </div>
        )}

        {!isLoading && plans?.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">Pronto publicaremos los planes.</p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan, index) => (
            <Reveal key={plan._id} delay={index * 100} className="h-full">
            <div
              className={cn(
                "hover-lift flex h-full flex-col items-center gap-4 rounded-2xl border bg-background p-6 text-center shadow-soft hover:shadow-soft-lg sm:items-start sm:text-left",
                plan.highlighted ? "border-accent ring-2 ring-accent/30" : "border-border"
              )}
            >
              {plan.highlighted && (
                <span className="flex w-fit items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                  <Star className="h-3 w-3" />
                  Más elegido
                </span>
              )}
              <div>
                <h3 className="font-heading text-lg font-semibold tracking-tight text-primary">{plan.name}</h3>
                {plan.description && <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>}
              </div>
              <p className="font-heading text-3xl font-semibold tracking-tight text-primary">
                {formatCurrency(plan.priceCents)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.billingPeriod === "monthly" ? "mes" : "año"}
                </span>
              </p>
              <ul className="flex w-full flex-col gap-2 text-left text-sm text-primary">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  Hasta {plan.limits.maxLocations} sede(s)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  Hasta {plan.limits.maxBarbers} barbero(s)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  Hasta {plan.limits.maxAppointmentsPerMonth} citas al mes
                </li>
                <li
                  className={cn(
                    "flex items-start gap-2",
                    !plan.whatsappEnabled && "text-muted-foreground"
                  )}
                >
                  {plan.whatsappEnabled ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )}
                  Recordatorios y confirmaciones por WhatsApp
                </li>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a href={salesWhatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-auto">
                <Button
                  variant={plan.highlighted ? "primary" : "secondary"}
                  className="w-full"
                >
                  Elegir {plan.name}
                </Button>
              </a>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="gradient-primary text-primary-foreground">
      <Reveal className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          ¿Listo para dejar de agendar por WhatsApp a mano?
        </h2>
        <p className="max-w-xl text-primary-foreground/70">
          Cuéntanos sobre tu barbería y te ayudamos a configurarla. Sin compromiso.
        </p>
        <a href={salesWhatsappUrl} target="_blank" rel="noopener noreferrer">
          <Button className="hover-lift px-6 py-3 text-base">Hablar por WhatsApp</Button>
        </a>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} uBarber</span>
        <Link to="/login" className="hover:text-primary">
          Ya tengo cuenta
        </Link>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <Hero />
      <Audiences />
      <DetailedHowItWorks />
      <Features />
      <HowItWorks />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  );
}
