"use client";

import { useEffect, useState } from "react";
import { RiUserSearchLine } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import { SectionCard, SectionHeader } from "../mora-operativo/MoraOperativoUI";

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
    <SectionCard>
      <SectionHeader
        title="Top 10 trabajadores con mayor deuda"
        description="Ranking de trabajadores con deuda pendiente más alta en la empresa."
        badge={`${data.length} trabajadores`}
        icon={RiUserSearchLine}
      />

      <div className="overflow-x-auto border-t border-indigo-100">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 font-semibold text-stone-700">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">RUT</th>
              <th className="px-6 py-4 text-right">Deuda</th>
              <th className="px-6 py-4 text-right">Periodos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-100">
          {data.map((item) => (
            <tr key={item.trabajadorRut}>
              <td className="px-6 py-4 font-semibold text-slate-950">{item.nombreCompleto}</td>
              <td className="px-6 py-4 text-stone-700">{item.trabajadorRut}</td>
              <td className="px-6 py-4 text-right font-semibold text-indigo-800">
                {formatCLP(item.totalDeudaPendiente)}
              </td>
              <td className="px-6 py-4 text-right text-stone-700">{item.periodosPendientes}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

export default TopTrabajadoresDeuda;
