"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
  Title,
} from "@tremor/react";
import {
  RiCalendarLine,
  RiHistoryLine,
  RiFileExcelLine,
  RiShieldUserLine,
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

const roleBadge = (rol) => {
  const r = String(rol || "").toLowerCase();
  if (r === "admin") return { color: "rose", label: "admin" };
  if (r === "supervisor") return { color: "amber", label: "supervisor" };
  if (r === "facturacion" || r === "facturación") return { color: "indigo", label: "facturacion" };
  if (r === "trabajador") return { color: "blue", label: "trabajador" };
  if (r === "cliente") return { color: "cyan", label: "cliente" };
  return { color: "gray", label: rol || "-" };
};

const userStatusBadge = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "ACTIVE") return { color: "emerald", label: "Activo" };
  if (s === "SUSPENDED") return { color: "red", label: "Suspendido" };
  return { color: "gray", label: status || "-" };
};

const sessionStatusBadge = (session) => {
  if (session?.revokedAt) return { color: "red", label: "Cerrada" };
  if (session?.expiresAt && new Date(session.expiresAt) < new Date()) {
    return { color: "amber", label: "Expirada" };
  }
  return { color: "emerald", label: "Activa" };
};

const csvEscape = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[\",\n]/.test(str)) {
    return `"${str.replace(/\"/g, "\"\"")}"`;
  }
  return str;
};

const buildCsv = (rows) => {
  const headers = [
    "sessionId",
    "userId",
    "nombre",
    "apellido",
    "email",
    "rol",
    "status",
    "createdAt",
    "lastSeenAt",
    "expiresAt",
    "revokedAt",
    "revokedReason",
    "ip",
    "device",
    "userAgent",
  ];
  const lines = [headers.join(",")];
  rows.forEach((session) => {
    const user = session?.usuario || {};
    const line = [
      session?.id,
      user?.id,
      user?.nombre,
      user?.apellido,
      user?.email,
      user?.rol,
      user?.status,
      session?.createdAt,
      session?.lastSeenAt,
      session?.expiresAt,
      session?.revokedAt,
      session?.revokedReason,
      session?.ip,
      session?.device,
      session?.userAgent,
    ].map(csvEscape);
    lines.push(line.join(","));
  });
  return lines.join("\n");
};

const HistorialConexionesPage = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [from, to, search, roleFilter, statusFilter, pageSize]);

  const fetchSessions = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
      };
      if (from) params.from = from;
      if (to) params.to = to;
      if (search) params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const { data: response } = await api.get("/admin/auth/session-history", {
        params,
      });
      setData(response);
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo cargar el historial de conexiones."
      );
    } finally {
      setLoading(false);
    }
  }, [from, to, search, roleFilter, statusFilter, page, pageSize]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const sessions = useMemo(() => data?.sessions || [], [data]);
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleExportCsv = useCallback(() => {
    if (!sessions.length) return;
    const csv = buildCsv(sessions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `historial-conexiones_${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Title className="text-3xl font-extrabold text-slate-900">
                Historial de Conexiones
              </Title>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <Icon icon={RiHistoryLine} variant="simple" size="sm" />
                <span className="text-xs font-semibold text-slate-700">Global</span>
              </div>
            </div>
            <Text className="flex items-center gap-2 text-slate-600">
              <Icon icon={RiCalendarLine} variant="simple" size="sm" />
              Rango seleccionado para sesiones creadas
              <span className="text-slate-300">•</span>
              Última actualización: <span className="font-semibold">{formatDateTime(lastUpdatedAt)}</span>
            </Text>
          </div>

          <Card className="w-full md:w-auto shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2">
              <Button
                icon={RiFileExcelLine}
                onClick={handleExportCsv}
                variant="secondary"
                disabled={!sessions.length}
              >
                Exportar CSV
              </Button>
              <Button
                icon={RiWifiLine}
                onClick={fetchSessions}
                loading={loading}
                variant="primary"
              >
                Actualizar
              </Button>
            </div>
          </Card>
        </div>

        <Card className="shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Desde
              </label>
              <TextInput
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Hasta
              </label>
              <TextInput
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Buscar (usuario, email, IP, sesión)
              </label>
              <TextInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ej: cristian@previley.cl"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tamaño página
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Rol
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="all">Todos</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="facturacion">Facturación</option>
                <option value="trabajador">Trabajador</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estado usuario
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="all">Todos</option>
                <option value="ACTIVE">Activo</option>
                <option value="SUSPENDED">Suspendido</option>
              </select>
            </div>
          </div>
        </Card>

        <Grid numItemsSm={2} numItemsLg={2} className="gap-6">
          <Card className="shadow-sm ring-1 ring-slate-200">
            <Flex justifyContent="start" className="gap-4">
              <div className="rounded-xl bg-blue-50 p-2 ring-1 ring-blue-100">
                <Icon icon={RiShieldUserLine} variant="simple" size="lg" color="blue" />
              </div>
              <div>
                <Text className="text-slate-600">Total sesiones</Text>
                <Title className="text-2xl font-bold text-slate-900">{total}</Title>
              </div>
            </Flex>
          </Card>
          <Card className="shadow-sm ring-1 ring-slate-200">
            <Flex justifyContent="start" className="gap-4">
              <div className="rounded-xl bg-indigo-50 p-2 ring-1 ring-indigo-100">
                <Icon icon={RiHistoryLine} variant="simple" size="lg" color="indigo" />
              </div>
              <div>
                <Text className="text-slate-600">Página actual</Text>
                <Title className="text-2xl font-bold text-slate-900">
                  {page} / {totalPages}
                </Title>
              </div>
            </Flex>
          </Card>
        </Grid>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <Card className="p-0 overflow-hidden shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                Sesiones
              </span>
              <Badge size="xs" color="slate" variant="light">
                {sessions.length}
              </Badge>
            </div>
            <Text className="text-xs text-slate-500">Fuente: /admin/auth/session-history</Text>
          </div>

          <Table>
            <TableHead className="bg-slate-50">
              <TableRow>
                <TableHeaderCell className="text-slate-500">Usuario</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">Email</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">Rol</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">Estado</TableHeaderCell>
                <TableHeaderCell className="text-slate-500 text-center">Conexión</TableHeaderCell>
                <TableHeaderCell className="text-slate-500 text-center">Última actividad</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">IP</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">Dispositivo</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">Agente</TableHeaderCell>
                <TableHeaderCell className="text-slate-500 text-center">Sesión</TableHeaderCell>
                <TableHeaderCell className="text-slate-500 text-right">Detalle</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-10 text-center text-slate-400">
                    Cargando historial de conexiones…
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-12 text-center text-slate-400 italic">
                    No se encontraron sesiones en este rango.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => {
                  const rb = roleBadge(session?.usuario?.rol);
                  const ub = userStatusBadge(session?.usuario?.status);
                  const sb = sessionStatusBadge(session);
                  const userId = session?.usuario?.id;
                  return (
                    <TableRow key={session.id} className="hover:bg-slate-50/60 transition-colors">
                      <TableCell>
                        <div className="leading-tight">
                          <Text className="font-semibold text-slate-900">
                            {session?.usuario?.nombre} {session?.usuario?.apellido}
                          </Text>
                          <Text className="text-xs text-slate-500">ID: {session?.usuario?.id}</Text>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Text className="text-slate-600 font-medium">{session?.usuario?.email}</Text>
                      </TableCell>
                      <TableCell>
                        <Badge color={rb.color} size="xs" variant="light">
                          {rb.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge color={ub.color} size="xs" variant="light">
                          {ub.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Text className="text-xs text-slate-600">{formatDateTime(session.createdAt)}</Text>
                      </TableCell>
                      <TableCell className="text-center">
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
                          className="text-xs text-slate-600 max-w-[220px] truncate"
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
                      <TableCell className="text-right">
                        {userId ? (
                          <Link
                            href={`/admin/historial-conexiones/${userId}`}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            Ver
                          </Link>
                        ) : (
                          <Text className="text-xs text-slate-400">-</Text>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <Text className="text-xs text-slate-500">
            Total: {total} sesiones
          </Text>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </Button>
            <Text className="text-xs text-slate-600">
              Página {page} de {totalPages}
            </Text>
            <Button
              variant="secondary"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialConexionesPage;
