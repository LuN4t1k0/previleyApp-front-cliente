"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from "@tremor/react";
import {
  RiArrowLeftLine,
  RiHistoryLine,
  RiWifiLine,
} from "@remixicon/react";
import api from "@/app/api/apiService";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const sessionStatusBadge = (session) => {
  if (session?.revokedAt) return { color: "red", label: "Cerrada" };
  if (session?.expiresAt && new Date(session.expiresAt) < new Date()) {
    return { color: "amber", label: "Expirada" };
  }
  return { color: "emerald", label: "Activa" };
};

const HistorialConexionesUsuarioPage = () => {
  const params = useParams();
  const userId = params?.userId;

  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    setError("");
    setLoading(true);
    try {
      const { data: response } = await api.get(
        `/admin/auth/users/${userId}/sessions`
      );
      const sessions = response?.sessions || [];
      setData(sessions);
      setUser(sessions[0]?.usuario || null);
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo cargar el historial del usuario."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const sessions = useMemo(() => data || [], [data]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Title className="text-3xl font-extrabold text-slate-900">
                Historial de Usuario
              </Title>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <Icon icon={RiHistoryLine} variant="simple" size="sm" />
                <span className="text-xs font-semibold text-slate-700">
                  {user?.nombre || "Usuario"} {user?.apellido || ""}
                </span>
              </div>
            </div>
            <Text className="text-slate-600">
              Usuario ID: <span className="font-semibold">{userId}</span>
              <span className="text-slate-300">•</span>
              Última actualización: <span className="font-semibold">{formatDateTime(lastUpdatedAt)}</span>
            </Text>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/historial-conexiones"
              className="text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              <span className="inline-flex items-center gap-2">
                <RiArrowLeftLine className="h-4 w-4" />
                Volver
              </span>
            </Link>
            <Button icon={RiWifiLine} onClick={fetchSessions} loading={loading}>
              Actualizar
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <Card className="p-0 overflow-hidden shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Sesiones del usuario</span>
              <Badge size="xs" color="slate" variant="light">
                {sessions.length}
              </Badge>
            </div>
          </div>

          <Table>
            <TableHead className="bg-slate-50">
              <TableRow>
                <TableHeaderCell className="text-slate-500">Conexión</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">Última actividad</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">IP</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">Dispositivo</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">Agente</TableHeaderCell>
                <TableHeaderCell className="text-slate-500 text-center">Estado</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-400">
                    Cargando sesiones…
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No se registran sesiones para este usuario.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => {
                  const sb = sessionStatusBadge(session);
                  return (
                    <TableRow key={session.id} className="hover:bg-slate-50/60 transition-colors">
                      <TableCell>
                        <Text className="text-xs text-slate-600">{formatDateTime(session.createdAt)}</Text>
                      </TableCell>
                      <TableCell>
                        <Text className="text-xs text-slate-600">{formatDateTime(session.lastSeenAt)}</Text>
                      </TableCell>
                      <TableCell>
                        <Text className="text-xs text-slate-600">{session.ip || "-"}</Text>
                      </TableCell>
                      <TableCell>
                        <Text className="text-xs text-slate-600">{session.device || "-"}</Text>
                      </TableCell>
                      <TableCell>
                        <Text
                          className="text-xs text-slate-600 max-w-[280px] truncate"
                          title={session.userAgent || "-"}
                        >
                          {session.userAgent || "-"}
                        </Text>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge color={sb.color} size="xs" variant="light">
                          {sb.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default HistorialConexionesUsuarioPage;
