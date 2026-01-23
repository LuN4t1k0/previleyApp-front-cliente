"use client";

import { useMemo, useState } from "react";
import { RiFileTextLine } from "@remixicon/react";
import { SearchSelect, SearchSelectItem } from "@tremor/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { useEmpresasServicios } from "@/hooks/useEmpresasServicios";
import CompanyServicesCard from "@/components/dashboard/CompanyServicesCard";

const ALL_EMPRESAS = "ALL";

const ContratosPage = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const {
    data: empresasConServicios,
    loading: loadingServicios,
  } = useEmpresasServicios(empresas);

  const [selectedEmpresaRut, setSelectedEmpresaRut] = useState(ALL_EMPRESAS);

  const empresaOptions = useMemo(() => {
    const unique = new Map();
    (empresasConServicios || []).forEach((empresa) => {
      if (!empresa?.empresaRut) return;
      unique.set(empresa.empresaRut, empresa.nombre || empresa.empresaRut);
    });
    return Array.from(unique.entries()).map(([rut, nombre]) => ({
      rut,
      nombre,
    }));
  }, [empresasConServicios]);

  const filteredEmpresas = useMemo(() => {
    if (!empresasConServicios) return [];
    if (selectedEmpresaRut === ALL_EMPRESAS) {
      return empresasConServicios;
    }
    return empresasConServicios.filter(
      (empresa) => empresa.empresaRut === selectedEmpresaRut
    );
  }, [empresasConServicios, selectedEmpresaRut]);

  const totalEmpresas = filteredEmpresas.length;

  const content = useMemo(() => {
    if (loadingEmpresas || loadingServicios) {
      return (
        <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-500">
          Cargando contratos de servicios...
        </div>
      );
    }

    if (!filteredEmpresas || filteredEmpresas.length === 0) {
      return (
        <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-500">
          No se encontraron servicios para la empresa seleccionada.
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {filteredEmpresas.map((empresa) => (
          <CompanyServicesCard key={empresa.empresaRut} empresa={empresa} />
        ))}
      </div>
    );
  }, [filteredEmpresas, loadingEmpresas, loadingServicios]);

  return (
    <section className="pb-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 pt-10 sm:px-6 lg:px-8">
        <header className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 md:p-12">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600">
                <RiFileTextLine className="h-3 w-3" />
                Contratos
              </span>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Servicios por empresa
              </h1>
              <p className="max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
                Revisa el detalle de los servicios contratados por cada empresa.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-xs font-semibold text-slate-500">
              <RiFileTextLine className="h-4 w-4" />
              Empresas con contratos: {totalEmpresas}
            </div>
          </div>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        </header>

        <div className="glass-panel flex flex-col gap-3 rounded-[2rem] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Filtrar por empresa</h2>
            <p className="text-xs text-slate-500">
              Selecciona una empresa para ver sus contratos.
            </p>
          </div>
          <div className="min-w-[240px] max-w-sm">
            <SearchSelect
              value={selectedEmpresaRut}
              onValueChange={setSelectedEmpresaRut}
              placeholder="Selecciona una empresa"
            >
              <SearchSelectItem value={ALL_EMPRESAS}>
                Todas las empresas
              </SearchSelectItem>
              {empresaOptions.map((empresa) => (
                <SearchSelectItem key={empresa.rut} value={empresa.rut}>
                  {empresa.nombre} ({empresa.rut})
                </SearchSelectItem>
              ))}
            </SearchSelect>
          </div>
        </div>

        {content}
      </div>
    </section>
  );
};

export default ContratosPage;
