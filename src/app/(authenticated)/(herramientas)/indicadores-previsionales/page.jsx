'use client';
// 'use client';

import { useState, useEffect } from "react";
import {
  Title,
  Text,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Grid,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  Card,
  Flex,
} from "@tremor/react";
import { usePeriodos } from "@/hooks/usePeriodos";
import { useIndicadores } from "@/hooks/useIndicadores";
import { formatPeriodo } from "@/utils/formatPeriodo";

const formatCLP = (value) => {
  const num = parseFloat(value?.toString().replace(/[$.\s]/g, "").replace(",", "."));
  return isNaN(num)
    ? "-"
    : `$${Intl.NumberFormat("es-CL", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(num)}`;
};

export default function IndicadoresPrevisionalesPage() {
  const { periodos } = usePeriodos();
  const [periodo, setPeriodo] = useState(null);
  const { data: ind, loading, error } = useIndicadores(periodo);

  useEffect(() => {
    if (periodos.length > 0) setPeriodo(periodos[0]);
  }, [periodos]);

  const renderTable = (title, headers, rows) => (
    <Card className="p-4">
      <Title className="text-base font-semibold text-tremor-content-strong mb-2">
        {title}
      </Title>
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow className="border-b">
              {headers.map((h, i) => (
                <TableHeaderCell key={i} className="uppercase text-xs text-gray-600">
                  {h}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} className="even:bg-tremor-background-muted">
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Flex justifyContent="between" alignItems="center" className="mb-4">
        <div>
          <Badge>Indicadores Oficiales</Badge>
          <Title className="mt-2 text-3xl font-bold text-tremor-content-strong">
            Indicadores Previsionales y Tributarios
          </Title>
          <Text className="mt-1 max-w-2xl text-tremor-default">
            Consulta y compara los valores oficiales para cotizaciones previsionales y cálculos tributarios.
          </Text>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            className="px-4 py-2 border rounded-tremor-small"
            value={periodo || ""}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            {periodos.map((p) => (
              <option key={p} value={p}>
                {formatPeriodo(p)}
              </option>
            ))}
          </select>
        </div>
      </Flex>

      {loading ? (
        <Text>Cargando indicadores...</Text>
      ) : error ? (
        <Text className="text-red-500 font-medium">Error al cargar datos</Text>
      ) : ind ? (
        <TabGroup>
          <TabList>
            <Tab>Valores</Tab>
            <Tab>Cotizaciones</Tab>
            <Tab>Asignaciones</Tab>
            <Tab>Rentas</Tab>
            <Tab>Impuestos</Tab>
          </TabList>
          <TabPanels className="mt-6 space-y-12">
            <TabPanel>
              <Grid numItemsMd={2} className="gap-6">
                {renderTable("Valor UF", ["Fecha", "UF"], ind.valor_uf.Fecha.map((f, i) => [f, (ind.valor_uf.UF[i])]))}
                {renderTable("UTM / UTA", ["Valor", "UTM", "UTA"], ind.valor_utm_uta.valor.map((v, i) => [v, formatCLP(ind.valor_utm_uta.utm[i]), formatCLP(ind.valor_utm_uta.uta[i])]))}
              </Grid>
            </TabPanel>
            <TabPanel>
              <div className="space-y-8">
                {renderTable("AFP", ["AFP", "% Dependientes", "% Independientes", "SIS"], ind.afp.afp.map((n, i) => [n, ind.afp.tasa_afp_dependientes[i], ind.afp.tasa_afp_independientes[i], ind.afp.SIS_dependientes[i]]))}
                {renderTable("Seguro de Cesantía", ["Contrato", "Trabajador", "Empleador"], ind.seguro_de_cesantia.contrato.map((c, i) => [c, ind.seguro_de_cesantia.financiamiento_trabajador[i], ind.seguro_de_cesantia.financiemiento_empleador[i]]))}
                {renderTable("Trabajos Pesados", ["Puesto", "Calificación", "Empleador", "Trabajador"], ind.cotizacion_trabajos_pesados.puesto_de_trabajo.map((p, i) => [p, ind.cotizacion_trabajos_pesados.calificación[i], ind.cotizacion_trabajos_pesados.financiamiento_empleador[i], ind.cotizacion_trabajos_pesados.financiamiento_trabajador[i]]))}
              </div>
            </TabPanel>
            <TabPanel>
              <div className="space-y-8">
                {renderTable("Asignación Familiar", ["Tramo", "Requisito Renta", "Monto"], ind.asignacion_familiar.tramo.map((t, i) => [t, ind.asignacion_familiar.requisito_de_renta[i], formatCLP(ind.asignacion_familiar.monto[i])]))}
                {renderTable("Mutual y SANNA", ["Tipo", "%"], ind.mutual_sanna.tipo.map((t, i) => [t, ind.mutual_sanna.porcentaje[i]]))}
              </div>
            </TabPanel>
            <TabPanel>
              <Grid numItemsMd={2} className="gap-6">
                {renderTable("Rentas mínimas imponibles", ["Grupo", "Valor"], ind.rentas_minimas_imponibles.grupo.map((g, i) => [g, formatCLP(ind.rentas_minimas_imponibles.valor[i])]))}
                {renderTable("Rentas topes imponibles", ["Grupo", "Valor"], ind.rentas_topes_imponibles.grupo.map((g, i) => [g, formatCLP(ind.rentas_topes_imponibles.valor[i])]))}
              </Grid>
            </TabPanel>
            <TabPanel>
              {renderTable("Impuesto 2° Categoría", ["Desde", "Hasta", "Rebaja", "Factor", "Tasa Máxima"], ind.impuestosegundacatsii.desde.map((d, i) => [d, ind.impuestosegundacatsii.hasta[i], formatCLP(ind.impuestosegundacatsii.cantidad_a_rebajar[i]), ind.impuestosegundacatsii.factor[i], ind.impuestosegundacatsii.tasa_de_impuesto_efectiva_maxima[i]]))}
            </TabPanel>
          </TabPanels>
        </TabGroup>
      ) : (
        <Text>No hay datos para este período.</Text>
      )}
    </div>
  );
}
