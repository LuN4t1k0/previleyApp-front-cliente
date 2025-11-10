"use client";

import React from "react";
import ComisionesHub from "@/components/dashboard/comisiones/ComisionesHub";

const AdminComisionesHubPage = () => {
  const sections = [
    {
      name: "Resumen mensual",
      description: "Ver comisiones por trabajador en el período.",
      icon: "📊",
      path: "/admin/comisiones/resumen",
      roles: ["admin"],
    },
    {
      name: "Metas y porcentajes",
      description: "Configura meta y % de comisión por trabajador.",
      icon: "🎯",
      path: "/admin/comisiones/metas",
      roles: ["admin"],
    },
    {
      name: "Histórico y reportes",
      description: "Descarga o revisa los meses ya cerrados.",
      icon: "🗂️",
      path: "/admin/comisiones/historicos",
      roles: ["admin"],
    },
    {
      name: "Inteligencia",
      description: "KPIs y rankings para tomar decisiones.",
      icon: "📈",
      path: "/admin/comisiones/inteligencia",
      roles: ["admin"],
    },
    {
      name: "Tramos de comisión",
      description: "Gestiona los tramos progresivos de cada trabajador.",
      icon: "📈",
      path: "/admin/comisiones/tramos",
      roles: ["admin"],
    },
  ];

  return <ComisionesHub config={sections} />;
};

export default AdminComisionesHubPage;
