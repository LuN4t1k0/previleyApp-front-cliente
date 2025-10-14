"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Badge,
  Button,
  Card,
  Switch,
  Text,
  Textarea,
} from "@tremor/react";
import {
  RiCalendarLine,
  RiCheckLine,
  RiHome4Line,
  RiMapPin2Line,
  RiUserLine,
} from "@remixicon/react";

import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import BackButton from "@/components/Button/BackButton";
import { cx } from "@/lib/utils";

const initialFormState = {
  enDomicilio: true,
  enReposo: true,
  observacion: "",
  evidencia: null,
};

function groupVisitas(visitas) {
  const groups = new Map();
  visitas.forEach((visita) => {
    const key = visita.gestion?.folio || `Gestión #${visita.gestion?.id || "?"}`;
    const current = groups.get(key) || [];
    current.push(visita);
    groups.set(key, current);
  });
  return Array.from(groups.entries());
}

const MisVisitas = () => {
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);

  const [loading, setLoading] = useState(true);
  const [visitas, setVisitas] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [savingId, setSavingId] = useState(null);

  const fetchVisitas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/detalle-visita/mis-visitas", {
        params: { limit: 200, estado: "pendiente" },
      });
      setVisitas(response.data?.data || []);
    } catch (error) {
      console.error("Error obteniendo mis visitas", error);
      showErrorAlert("Error", "No fue posible cargar las visitas pendientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitas();
  }, [fetchVisitas]);

  useRealtimeEntity(socket, "detalleVisita", {
    onUpdated: () => fetchVisitas(),
    onCreated: () => fetchVisitas(),
    onDeleted: () => fetchVisitas(),
  });

  const groupedVisitas = useMemo(() => groupVisitas(visitas), [visitas]);

  const handleSelectVisit = (visita) => {
    setActiveId((prev) => (prev === visita.id ? null : visita.id));
    setFormState({
      enDomicilio: Boolean(visita.enDomicilio ?? true),
      enReposo: Boolean(visita.enReposo ?? true),
      observacion: visita.observacion || "",
      evidencia: null,
    });
  };

  const handleToggleField = (key, value) => {
    if (key === "enDomicilio" && !value) {
      setFormState((prev) => ({
        ...prev,
        enDomicilio: value,
        enReposo: false,
      }));
      return;
    }
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (visita) => {
    try {
      setSavingId(visita.id);
      const payload = new FormData();
      payload.append("enDomicilio", String(formState.enDomicilio));
      payload.append("enReposo", String(formState.enReposo));
      if (formState.observacion) payload.append("observacion", formState.observacion);
      if (formState.evidencia instanceof File) {
        payload.append("evidencia", formState.evidencia);
      }
      payload.append("estado", "completada");

      await apiService.patch(`/detalle-visita/${visita.id}`, payload);
      showSuccessAlert("Visita completada", "La visita fue registrada correctamente.");

      setActiveId(null);
      setFormState(initialFormState);
      fetchVisitas();
    } catch (error) {
      console.error("Error completando visita", error);
      const message =
        error?.response?.data?.message || "No fue posible guardar la visita.";
      showErrorAlert("Error", message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="theme-visitas">
      <div className="dashboard-gradient min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12">
          <BackButton />

          <header className="card-surface rounded-3xl border border-white/60 bg-white/70 p-8 shadow-elevated backdrop-blur">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="icon-chip h-12 w-12 text-2xl">🏠</span>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--theme-primary)]">
                    Panel operativo
                  </span>
                  <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                    Mis visitas pendientes
                  </h1>
                  <p className="max-w-2xl text-base text-[color:var(--text-secondary)] md:text-lg">
                    Completa las visitas asignadas registrando la información del trabajador en terreno.
                  </p>
                </div>
              </div>
            </div>
          </header>

          {loading ? (
            <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-elevated backdrop-blur">
              <Text className="text-[color:var(--text-secondary)]">Cargando visitas pendientes...</Text>
            </Card>
          ) : groupedVisitas.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 rounded-2xl border border-white/60 bg-white/80 py-10 text-center shadow-elevated backdrop-blur">
              <RiCheckLine className="h-10 w-10 text-[color:var(--theme-primary)]" />
              <Text className="text-[color:var(--text-secondary)]">
                No tienes visitas pendientes por completar.
              </Text>
            </Card>
          ) : (
            groupedVisitas.map(([groupName, items]) => (
              <div key={groupName} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                      {groupName}
                    </h2>
                    <div className="mt-1 h-1 w-16 rounded-full bg-[color:var(--theme-accent)]" />
                  </div>
                  <Badge color="orange">
                    {items.length} visita{items.length === 1 ? "" : "s"}
                  </Badge>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {items.map((visita) => {
                    const isActive = activeId === visita.id;
                    const fechaProgramada = visita.fechaProgramada
                      ? new Date(visita.fechaProgramada).toLocaleDateString()
                      : null;
                    return (
                      <Card
                        key={visita.id}
                        className={cx(
                          "space-y-3 rounded-2xl border border-white/60 bg-white/85 shadow-elevated backdrop-blur transition-all duration-300",
                          isActive
                            ? "ring-2 ring-[color:var(--theme-accent)]"
                            : "hover:-translate-y-1 hover:shadow-[0_32px_70px_-45px_rgba(31,34,41,0.35)]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-semibold text-[color:var(--text-primary)]">
                              <RiUserLine className="h-4 w-4 text-[color:var(--theme-primary)]" />
                              <span>
                                {[visita.nombreTrabajador, visita.apellidoTrabajador]
                                  .filter(Boolean)
                                  .join(" ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
                              <RiMapPin2Line className="h-4 w-4" />
                              <span>{visita.direccion || "Sin dirección registrada"}</span>
                            </div>
                            {fechaProgramada ? (
                              <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
                                <RiCalendarLine className="h-4 w-4" />
                                <span>{fechaProgramada}</span>
                              </div>
                            ) : null}
                          </div>
                          <Badge color="orange">Pendiente</Badge>
                        </div>

                        {isActive ? (
                          <div className="space-y-4 border-t border-dashed border-white/70 pt-4">
                            <div className="flex items-center justify-between rounded-xl border border-white/70 bg-white/70 px-3 py-2">
                              <div>
                                <Text className="text-sm font-semibold text-[color:var(--text-primary)]">
                                  Trabajador en domicilio
                                </Text>
                                <Text className="text-xs text-[color:var(--text-secondary)]">
                                  Marca si el trabajador estaba presente.
                                </Text>
                              </div>
                              <Switch
                                checked={formState.enDomicilio}
                                onChange={(value) => handleToggleField("enDomicilio", value)}
                              />
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-white/70 bg-white/70 px-3 py-2">
                              <div>
                                <Text className="text-sm font-semibold text-[color:var(--text-primary)]">
                                  Cumple reposo indicado
                                </Text>
                                <Text className="text-xs text-[color:var(--text-secondary)]">
                                  Solo disponible si estaba en domicilio.
                                </Text>
                              </div>
                              <Switch
                                checked={formState.enReposo}
                                onChange={(value) => handleToggleField("enReposo", value)}
                                disabled={!formState.enDomicilio}
                              />
                            </div>

                            <div className="space-y-2">
                              <Text className="text-sm font-semibold text-[color:var(--text-primary)]">
                                Observaciones
                              </Text>
                              <Textarea
                                minRows={3}
                                value={formState.observacion}
                                onChange={(e) => handleToggleField("observacion", e.target.value)}
                                placeholder="Agrega comentarios relevantes de la visita"
                                className="border-white/70 bg-white/70"
                              />
                            </div>

                            <div className="space-y-2">
                              <Text className="text-sm font-semibold text-[color:var(--text-primary)]">
                                Evidencia fotográfica
                              </Text>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleToggleField("evidencia", e.target.files?.[0] || null)
                                }
                                className="block w-full text-sm text-[color:var(--text-secondary)] file:mr-4 file:rounded-md file:border-0 file:bg-[color:var(--theme-soft)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--theme-primary)] hover:file:bg-[color:var(--theme-highlight)]"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setActiveId(null);
                                  setFormState(initialFormState);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                className="bg-[color:var(--theme-primary)] text-white hover:bg-[color:var(--theme-primary-dark)] focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-accent)]"
                                loading={savingId === visita.id}
                                onClick={() => handleSubmit(visita)}
                              >
                                Guardar visita
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between border-t border-dashed border-white/70 pt-3">
                            <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
                              <RiHome4Line className="h-4 w-4 text-[color:var(--theme-primary)]" />
                              <span>
                                {visita.comuna || visita.ciudad || "Sin comuna"} · {visita.empresaRut}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className="bg-white/90 text-[color:var(--theme-primary)] hover:bg-[color:var(--theme-soft)]"
                              onClick={() => handleSelectVisit(visita)}
                            >
                              Completar visita
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default MisVisitas;
