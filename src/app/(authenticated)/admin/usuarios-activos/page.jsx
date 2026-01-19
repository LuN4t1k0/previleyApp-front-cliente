// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { Button, Card, TextInput } from "@tremor/react";
// import { RiRefreshLine, RiLogoutBoxRLine } from "@remixicon/react";
// import api from "@/app/api/apiService";

// const formatDate = (value) => {
//   if (!value) return "-";
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return "-";
//   return date.toLocaleString("es-CL");
// };

// const UsuariosActivosPage = () => {
//   const [minutes, setMinutes] = useState(15);
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const fetchActiveUsers = useCallback(async () => {
//     setError("");
//     setLoading(true);
//     try {
//       const { data: response } = await api.get("/admin/auth/active-users", {
//         params: { minutes },
//       });
//       setData(response);
//     } catch (err) {
//       setError(err?.response?.data?.message || "No se pudo cargar usuarios activos.");
//     } finally {
//       setLoading(false);
//     }
//   }, [minutes]);

//   useEffect(() => {
//     fetchActiveUsers();
//   }, [fetchActiveUsers]);

//   const handleRevokeSessions = async (userId) => {
//     const confirmed = window.confirm(
//       "¿Seguro que quieres desconectar a este usuario?"
//     );
//     if (!confirmed) return;
//     try {
//       await api.post(`/admin/auth/users/${userId}/revoke-sessions`, {
//         reason: "ADMIN_FORCE_LOGOUT",
//       });
//       await fetchActiveUsers();
//     } catch (err) {
//       setError(err?.response?.data?.message || "No se pudo desconectar al usuario.");
//     }
//   };

//   const users = data?.users || [];

//   return (
//     <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Usuarios activos</h1>
//           <p className="text-sm text-slate-500">
//             Sesiones activas en los últimos {data?.cutoffMinutes || minutes} minutos.
//           </p>
//         </div>
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
//           <div>
//             <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
//               Ventana (minutos)
//             </label>
//             <TextInput
//               type="number"
//               min={1}
//               value={minutes}
//               onChange={(e) => setMinutes(Number(e.target.value))}
//               className="mt-2 w-32"
//             />
//           </div>
//           <Button icon={RiRefreshLine} onClick={fetchActiveUsers} disabled={loading}>
//             {loading ? "Cargando..." : "Refrescar"}
//           </Button>
//         </div>
//       </div>

//       {error && (
//         <Card className="border border-rose-200 bg-rose-50 text-rose-700">
//           {error}
//         </Card>
//       )}

//       <Card className="overflow-x-auto">
//         <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <p className="text-sm text-slate-600">
//             Total usuarios activos: <strong>{data?.totalUsers || 0}</strong>
//           </p>
//           <p className="text-sm text-slate-600">
//             Total sesiones: <strong>{data?.totalSessions || 0}</strong>
//           </p>
//         </div>
//         <table className="min-w-full text-sm">
//           <thead>
//             <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-widest text-slate-500">
//               <th className="py-3 pr-4">Usuario</th>
//               <th className="py-3 pr-4">Email</th>
//               <th className="py-3 pr-4">Rol</th>
//               <th className="py-3 pr-4">Última actividad</th>
//               <th className="py-3 pr-4">Acciones</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {users.length === 0 && (
//               <tr>
//                 <td colSpan={5} className="py-6 text-center text-slate-500">
//                   No hay usuarios activos en este periodo.
//                 </td>
//               </tr>
//             )}
//             {users.map((user) => (
//               <tr key={user.id}>
//                 <td className="py-3 pr-4 font-semibold text-slate-900">
//                   {user.nombre} {user.apellido}
//                 </td>
//                 <td className="py-3 pr-4 text-slate-600">{user.email}</td>
//                 <td className="py-3 pr-4 text-slate-600">{user.rol}</td>
//                 <td className="py-3 pr-4 text-slate-600">
//                   {formatDate(user.lastSeenAt)}
//                 </td>
//                 <td className="py-3 pr-4">
//                   <Button
//                     size="xs"
//                     variant="secondary"
//                     icon={RiLogoutBoxRLine}
//                     onClick={() => handleRevokeSessions(user.id)}
//                   >
//                     Desconectar
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </Card>
//     </div>
//   );
// };

// export default UsuariosActivosPage;


// NUEVO:
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  TextInput,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
  Title,
  Icon,
  Flex,
  Grid,
} from "@tremor/react";
import {
  RiRefreshLine,
  RiLogoutBoxRLine,
  RiTimeLine,
  RiGroupLine,
  RiShieldUserLine,
} from "@remixicon/react";
import api from "@/app/api/apiService";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
};

const formatClock = (value) => {
  if (!value) return "-";
  return value.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
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

const initials = (nombre, apellido) => {
  const n = String(nombre || "").trim();
  const a = String(apellido || "").trim();
  const i1 = n ? n[0].toUpperCase() : "?";
  const i2 = a ? a[0].toUpperCase() : "";
  return `${i1}${i2}`;
};

const UsuariosActivosPage = () => {
  const [minutes, setMinutes] = useState(15);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isLive, setIsLive] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const liveIntervalRef = useRef(null);

  const fetchActiveUsers = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const { data: response } = await api.get("/admin/auth/active-users", {
        params: { minutes },
      });
      setData(response);
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar usuarios activos.");
    } finally {
      setLoading(false);
    }
  }, [minutes]);

  useEffect(() => {
    fetchActiveUsers();
  }, [fetchActiveUsers]);

  // Auto-refresh opcional (30s)
  useEffect(() => {
    if (!autoRefresh) {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
      return;
    }

    liveIntervalRef.current = setInterval(() => {
      fetchActiveUsers();
    }, 30000);

    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    };
  }, [autoRefresh, fetchActiveUsers]);

  const handleRevokeSessions = async (userId) => {
    const confirmed = window.confirm("¿Seguro que quieres desconectar a este usuario?");
    if (!confirmed) return;
    try {
      await api.post(`/admin/auth/users/${userId}/revoke-sessions`, {
        reason: "ADMIN_FORCE_LOGOUT",
      });
      await fetchActiveUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo desconectar al usuario.");
    }
  };

  const users = useMemo(() => data?.users || [], [data]);
  const cutoff = data?.cutoffMinutes || minutes;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Title className="text-3xl font-extrabold text-slate-900">
                Panel de Usuarios
              </Title>

              {/* LIVE STATUS */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-30" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  {isLive ? "Live" : "Pausado"}
                </span>
              </div>
            </div>

            <Text className="flex items-center gap-2 text-slate-600">
              <Icon icon={RiTimeLine} variant="simple" size="sm" />
              Monitoreo de sesiones en los últimos <span className="font-semibold">{cutoff}</span>{" "}
              minutos
              <span className="text-slate-300">•</span>
              Última actualización:{" "}
              <span className="font-semibold">{formatClock(lastUpdatedAt)}</span>
            </Text>
          </div>

          {/* TOOLBAR */}
          <Card className="w-full md:w-auto shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Rango (min)
                </label>
                <TextInput
                  type="number"
                  min={1}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-full sm:w-28"
                  placeholder="Minutos"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Live toggle simple */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !isLive;
                    setIsLive(next);
                    setAutoRefresh(next);
                  }}
                  className={[
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition",
                    isLive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-2 w-2 rounded-full",
                      isLive ? "bg-emerald-600" : "bg-slate-300",
                    ].join(" ")}
                  />
                  {isLive ? "Live ON" : "Live OFF"}
                </button>

                <Button
                  icon={RiRefreshLine}
                  onClick={fetchActiveUsers}
                  loading={loading}
                  variant="primary"
                  className="shadow-sm"
                >
                  Actualizar
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* STATS */}
        <Grid numItemsSm={2} numItemsLg={2} className="gap-6">
          <Card className="shadow-sm ring-1 ring-slate-200">
            <Flex justifyContent="start" className="gap-4">
              <div className="rounded-xl bg-blue-50 p-2 ring-1 ring-blue-100">
                <Icon icon={RiGroupLine} variant="simple" size="lg" color="blue" />
              </div>
              <div>
                <Text className="text-slate-600">Usuarios Activos</Text>
                <Title className="text-2xl font-bold text-slate-900">
                  {data?.totalUsers || 0}
                </Title>
              </div>
            </Flex>
          </Card>

          <Card className="shadow-sm ring-1 ring-slate-200">
            <Flex justifyContent="start" className="gap-4">
              <div className="rounded-xl bg-indigo-50 p-2 ring-1 ring-indigo-100">
                <Icon icon={RiShieldUserLine} variant="simple" size="lg" color="indigo" />
              </div>
              <div>
                <Text className="text-slate-600">Sesiones Abiertas</Text>
                <Title className="text-2xl font-bold text-slate-900">
                  {data?.totalSessions || 0}
                </Title>
              </div>
            </Flex>
          </Card>
        </Grid>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* TABLE */}
        <Card className="p-0 overflow-hidden shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Usuarios activos</span>
              <Badge size="xs" color="slate" variant="light">
                {users.length}
              </Badge>
            </div>
            <Text className="text-xs text-slate-500">Fuente: /admin/auth/active-users</Text>
          </div>

          <Table>
            <TableHead className="bg-slate-50">
              <TableRow>
                <TableHeaderCell className="text-slate-500">Usuario</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">Email</TableHeaderCell>
                <TableHeaderCell className="text-slate-500">Rol</TableHeaderCell>
                <TableHeaderCell className="text-slate-500 text-center">
                  Última actividad
                </TableHeaderCell>
                <TableHeaderCell className="text-slate-500 text-right">
                  Acción
                </TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-400">
                    Cargando usuarios activos…
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400 italic">
                    No se encontraron usuarios activos en este rango.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const rb = roleBadge(user.rol);
                  return (
                    <TableRow key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold ring-2 ring-white shadow-sm">
                            {initials(user.nombre, user.apellido)}
                          </div>
                          <div className="leading-tight">
                            <Text className="font-semibold text-slate-900">
                              {user.nombre} {user.apellido}
                            </Text>
                            <Text className="text-xs text-slate-500">ID: {user.id}</Text>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Text className="text-slate-600 font-medium">{user.email}</Text>
                      </TableCell>

                      <TableCell>
                        <Badge color={rb.color} size="xs" variant="light">
                          {rb.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <Text className="text-xs text-slate-600">{formatDate(user.lastSeenAt)}</Text>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="xs"
                          variant="light"
                          color="red"
                          icon={RiLogoutBoxRLine}
                          onClick={() => handleRevokeSessions(user.id)}
                          className="hover:bg-red-50"
                        >
                          Terminar
                        </Button>
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

export default UsuariosActivosPage;