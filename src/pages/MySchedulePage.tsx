import { useEffect, useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import { useMyBarberProfile, useUpdateMyShifts, type BarberShift } from "../hooks/useBarberSelf";
import { useLocations } from "../hooks/useLocations";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { Spinner } from "../components/ui/Spinner";

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function MySchedulePage() {
  const { data: profile, isLoading } = useMyBarberProfile();
  const { data: locations } = useLocations();
  const updateShifts = useUpdateMyShifts();
  const [shifts, setShifts] = useState<BarberShift[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile?.shifts) setShifts(profile.shifts);
  }, [profile]);

  const myLocations = locations?.filter((l) => profile?.locationIds.includes(l._id)) ?? [];

  function addShift() {
    setShifts((prev) => [
      ...prev,
      { locationId: myLocations[0]?._id ?? "", day: 1, startTime: "09:00", endTime: "18:00" },
    ]);
  }

  function updateShift(index: number, patch: Partial<BarberShift>) {
    setShifts((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeShift(index: number) {
    setShifts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError(null);
    setSaved(false);
    try {
      await updateShifts.mutateAsync(shifts);
      setSaved(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo guardar tu horario");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8 text-accent">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold text-primary">Mi horario</h1>
        <Button onClick={addShift} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar turno
        </Button>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Define en qué días y horarios atiendes en cada sede. Esto es lo que verá el negocio para
        agendarte citas.
      </p>

      <div className="flex flex-col gap-3">
        {shifts.map((shift, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-background shadow-soft p-4 sm:flex-row sm:items-end sm:gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface">
              <Clock className="h-4 w-4 text-accent" />
            </div>

            <select
              value={shift.locationId}
              onChange={(e) => updateShift(index, { locationId: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary sm:w-40"
            >
              {myLocations.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>

            <select
              value={shift.day}
              onChange={(e) => updateShift(index, { day: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary sm:w-36"
            >
              {DAY_LABELS.map((label, day) => (
                <option key={day} value={day}>
                  {label}
                </option>
              ))}
            </select>

            <Input
              type="time"
              value={shift.startTime}
              onChange={(e) => updateShift(index, { startTime: e.target.value })}
              className="sm:w-32"
            />
            <Input
              type="time"
              value={shift.endTime}
              onChange={(e) => updateShift(index, { endTime: e.target.value })}
              className="sm:w-32"
            />

            <button
              onClick={() => removeShift(index)}
              className="self-end rounded-lg p-2 text-danger hover:bg-surface sm:self-auto"
              aria-label="Eliminar turno"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {shifts.length === 0 && (
          <p className="text-sm text-muted-foreground">Aún no tienes turnos definidos.</p>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      {saved && !error && <p className="mt-3 text-sm text-success">Horario guardado.</p>}

      <Button onClick={handleSave} loading={updateShifts.isPending} className="mt-4 w-full sm:w-auto">
        Guardar horario
      </Button>
    </div>
  );
}
