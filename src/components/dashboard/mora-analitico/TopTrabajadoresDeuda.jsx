"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@tremor/react";
import apiService from "@/app/api/apiService";

const TopTrabajadoresDeuda = ({ empresaRut }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await apiService.get(`/mora-dashboard/${empresaRut}/top-pendientes`);
        const rawData = res.data.data || [];
        const normalized = rawData.map((item) => {
          const rawDeuda = item.totalDeudaPendiente;
          const calculateAmount = (value) => {
            const parsed = Number(value ?? 0);
            return Number.isFinite(parsed) ? parsed : 0;
          };

          const totalDeudaPendiente = Array.isArray(rawDeuda)
            ? rawDeuda.reduce((acc, value) => acc + calculateAmount(value), 0)
            : calculateAmount(rawDeuda);

          return {
            ...item,
            totalDeudaPendiente,
          };
        });

        setData(normalized);
      } catch (error) {
        console.error("Error cargando top trabajadores:", error);
      }
    };

    if (empresaRut) fetchTop();
  }, [empresaRut]);

  if (!data.length) return null;

  const formatCLP = (n) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <Card>
      <Title>🏅 Top 10 Trabajadores con Mayor Deuda</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Ranking de trabajadores con deuda pendiente más alta en la empresa.
      </Text>
      <Table className="text-sm">
        <TableHead>
          <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
            <TableHeaderCell className="text-tremor-content-strong">Nombre</TableHeaderCell>
            <TableHeaderCell className="text-tremor-content-strong">RUT</TableHeaderCell>
            <TableHeaderCell className="text-right text-tremor-content-strong">Deuda</TableHeaderCell>
            <TableHeaderCell className="text-right text-tremor-content-strong">Periodos</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.trabajadorRut}>
              <TableCell className="font-medium text-tremor-content-strong">
                {item.nombreCompleto}
              </TableCell>
              <TableCell>{item.trabajadorRut}</TableCell>
              <TableCell className="text-right text-gray-800 dark:text-gray-100">
                {formatCLP(item.totalDeudaPendiente)}
              </TableCell>
              <TableCell className="text-right">{item.periodosPendientes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TopTrabajadoresDeuda;
