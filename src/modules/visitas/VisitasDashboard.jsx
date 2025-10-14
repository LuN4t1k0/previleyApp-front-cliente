"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Metric,
  Text,
  Table,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableBody,
  TableCell,
} from "@tremor/react";
import { useSession } from "next-auth/react";

import apiService from "@/app/api/apiService";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";

const numberFormat = (value = 0) => Number(value || 0).toLocaleString();

const VisitasDashboard = () => {
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);

  const [metrics, setMetrics] = useState({
    totalGestiones: 0,
    gestionesCerradas: 0,
    visitasRealizadas: 0,
  });
  const [topGestiones, setTopGestiones] = useState([]);

  const fetchMetrics = async () => {
    try {
      const [gestionesRes, cerradasRes, visitasRes] = await Promise.all([
        apiService.get("/gestion-visita", { params: { limit: 1 } }),
        apiService.get("/gestion-visita", {
          params: { limit: 1, estado: "cerrada" },
        }),
        apiService.get("/detalle-visita", {
          params: { limit: 1, estado: "realizada,completada,cerrada" },
        }),
      ]);

      setMetrics({
        totalGestiones: gestionesRes.data?.total || 0,
        gestionesCerradas: cerradasRes.data?.total || 0,
        visitasRealizadas: visitasRes.data?.total || 0,
      });
    } catch (error) {
      console.error("Error cargando métricas de visitas", error);
      setMetrics({ totalGestiones: 0, gestionesCerradas: 0, visitasRealizadas: 0 });
    }
  };

  const fetchTopGestiones = async () => {
    try {
      const response = await apiService.get("/gestion-visita", {
        params: {
          limit: 5,
          sortField: "totalRealizadas",
          sortOrder: "desc",
        },
      });
      setTopGestiones(response.data?.data || []);
    } catch (error) {
      console.error("Error cargando ranking de gestiones", error);
      setTopGestiones([]);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchTopGestiones();
  }, []);

  useRealtimeEntity(socket, "gestionVisita", {
    onCreated: () => {
      fetchMetrics();
      fetchTopGestiones();
    },
    onUpdated: () => {
      fetchMetrics();
      fetchTopGestiones();
    },
    onDeleted: () => {
      fetchMetrics();
      fetchTopGestiones();
    },
  });

  useRealtimeEntity(socket, "detalleVisita", {
    onCreated: fetchMetrics,
    onUpdated: fetchMetrics,
    onDeleted: fetchMetrics,
  });

  const metricCards = useMemo(
    () => ([
      {
        title: "Gestiones totales",
        value: numberFormat(metrics.totalGestiones),
        description: "Gestiones de visitas registradas en la plataforma",
      },
      {
        title: "Gestiones cerradas",
        value: numberFormat(metrics.gestionesCerradas),
        description: "Procesos finalizados con producción generada",
      },
      {
        title: "Visitas realizadas",
        value: numberFormat(metrics.visitasRealizadas),
        description: "Visitas marcadas como realizadas/completadas",
      },
    ]),
    [metrics]
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="card-surface rounded-3xl border border-white/60 bg-white/75 p-8 shadow-elevated backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <span className="icon-chip h-12 w-12 text-2xl">📊</span>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--theme-primary)]">
                Panel operativo
              </span>
              <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                Dashboard de visitas domiciliarias
              </h1>
              <p className="max-w-3xl text-base text-[color:var(--text-secondary)] md:text-lg">
                Monitoriza gestiones activas, cierres y visitas completadas. El tablero se actualiza automáticamente con la última información registrada en terreno.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {metricCards.map((card) => (
          <Card
            key={card.title}
            className="rounded-2xl border border-white/60 bg-white/85 shadow-elevated backdrop-blur"
          >
            <Text className="text-sm text-[color:var(--text-secondary)]">{card.title}</Text>
            <Metric className="mt-1 text-[color:var(--text-primary)]">{card.value}</Metric>
            <Text className="mt-2 text-xs text-[color:var(--text-secondary)]">
              {card.description}
            </Text>
          </Card>
        ))}
      </div>

      <Card className="space-y-4 rounded-2xl border border-white/60 bg-white/85 shadow-elevated backdrop-blur">
        <div>
          <Text className="text-sm text-[color:var(--text-secondary)]">Ranking de gestiones</Text>
          <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
            Mayor número de visitas completadas
          </h2>
        </div>

        <Table className="rounded-xl border border-white/60">
          <TableHead>
            <TableRow className="bg-[color:var(--theme-soft)] text-[color:var(--text-secondary)]">
              <TableHeaderCell>Folio</TableHeaderCell>
              <TableHeaderCell>Empresa</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Planificadas</TableHeaderCell>
              <TableHeaderCell>Realizadas</TableHeaderCell>
              <TableHeaderCell>Tarifa</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topGestiones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Text className="text-sm text-[color:var(--text-secondary)]">
                    Aún no hay gestiones registradas.
                  </Text>
                </TableCell>
              </TableRow>
            ) : (
              topGestiones.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.folio || `#${item.id}`}</TableCell>
                  <TableCell>{item.empresaRut}</TableCell>
                  <TableCell>{item.estado}</TableCell>
                  <TableCell>{numberFormat(item.totalPlanificadas || 0)}</TableCell>
                  <TableCell>{numberFormat(item.totalRealizadas || 0)}</TableCell>
                  <TableCell>
                    {item.tarifaVisita
                      ? `$${Number(item.tarifaVisita).toLocaleString()}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default VisitasDashboard;
