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
      name: "Tramos",
      description: "Definir los tramos por trabajador.",
      icon: "🧩",
      path: "/admin/comisiones/tramos",
      roles: ["admin"],
    },
  ];

  return <ComisionesHub config={sections} />;
};

export default AdminComisionesHubPage;
