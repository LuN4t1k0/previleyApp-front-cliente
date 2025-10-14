"use client";

import React, { useEffect, useState } from "react";
import useUserData from "@/hooks/useUserData";
import apiService from "@/app/api/apiService";
import Loader from "@/components/loader/Loader";
import { Title, Text, Metric, BarChart, LineChart, Card } from "@tremor/react";

const ResumenPagex = ({ empresaRut }) => {
  const [resumen, setResumen] = useState(null);
  const [casos, setCasos] = useState(null);
  const [instituciones, setInstituciones] = useState([]);
  const [evolucion, setEvolucion] = useState([]);
  const [topTrabajadores, setTopTrabajadores] = useState([]);
  const [resueltos, setResueltos] = useState([]);
  const [loading, setLoading] = useState(true);

  const { id, rol } = useUserData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [res, estados, deuda, evo, top, completados] = await Promise.all([
          apiService.get(`/pagex-dashboard/${empresaRut}/resumen-financiero`),
          apiService.get(`/pagex-dashboard/${empresaRut}/casos-por-estado`),
          apiService.get(
            `/pagex-dashboard/${empresaRut}/deuda-por-institucion`
          ),
          apiService.get(`/pagex-dashboard/${empresaRut}/evolucion-temporal`),
          // apiService.get(`/pagex-dashboard/${empresaRut}/informe-trabajador`),
          // apiService.get(`/pagex-dashboard/${empresaRut}/informe-resueltos`),
        ]);

        // console.log(res.data.data);
        console.log(deuda.data.data);
        setResumen(res.data.data);
        setCasos(estados.data.data);
        setInstituciones(deuda.data.data);
        setEvolucion(evo.data.data);
        // setTopTrabajadores(top.data.data);
        // setResueltos(completados.data.data);
      } catch (error) {
        console.error("Error al cargar dashboard de Pagex:", error);
      } finally {
        setLoading(false);
      }
    };

    if (empresaRut) fetchData();
  }, [empresaRut]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 mt-6">
      <Title>Resumen Pago en Exceso</Title>

      {/* 1. Resumen financiero */}
      {resumen && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card>
      <Text>Total Solicitado</Text>
      <Metric>${resumen.totalSolicitado.toLocaleString()}</Metric>
    </Card>
    <Card>
      <Text>Total Recuperado</Text>
      <Metric>${resumen.totalRecuperado.toLocaleString()}</Metric>
    </Card>
    <Card>
      <Text>Total Pendiente</Text>
      <Metric>${resumen.totalPendiente.toLocaleString()}</Metric>
    </Card>
  </div>
)}

      {/* 2. Casos por estado */}
      {/* <Card>
        <Title>Casos por Estado</Title>
        <Text>
          Pendientes: {casos.pendientes}, Resueltos: {casos.resueltos}
        </Text>
        <Text className="mt-2">Avance: {casos.porcentajeAvance}%</Text>
      </Card> */}

      {/* 3. Deuda por institución */}
      <Card>
        <Title>Distribución por Institución</Title>
        <BarChart
          data={instituciones}
          category="monto"
          index="entidad"
          showLegend
        />
      </Card>

      {/* 4. Evolución temporal */}
      <Card>
        <Title>Evolución Temporal</Title>
        <LineChart
          data={evolucion}
          index="mes"
          categories={["solicitado", "devuelto"]}
          showLegend
        />
      </Card>

      {/* 5. Top trabajadores con deuda pendiente */}
      {/* <Card>
        <Title>Trabajadores con Más Deuda Pendiente</Title>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          {topTrabajadores.map((t) => (
            <li key={t.trabajadorRut}>
              {t.nombreCompleto} - ${t.totalDeudaPendiente.toLocaleString()} (
              {t.periodosPendientes} periodos)
            </li>
          ))}
        </ul>
      </Card> */}

      {/* 6. Informe trabajadores con casos resueltos */}
      {/* <Card>
        <Title>Trabajadores con Casos Resueltos</Title>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          {resueltos.map((r) => (
            <li key={r.trabajadorRut}>
              {r.nombreCompleto} - ${r.totalRecuperado.toLocaleString()} (
              {r.periodosResueltos} periodos)
            </li>
          ))}
        </ul>
      </Card> */}
    </div>
  );
};

export default ResumenPagex;
