"use client";

import React from 'react';
import { FilterProvider } from "@/context/FilterContext";
// ¡IMPORTANTE! Revisa que esta ruta de importación sea correcta para tu proyecto

import configuracion from "@/config/module/licencias/licenciasMedicas.config";
import { LicenciasModuleContent } from '../../../licencias-medicas/page';

const LicenciasTab = ({ gestionId, isEditable }) => {
  return (
    // Cada Tab tendrá su propio contexto de filtros, aislado de los demás
    <FilterProvider config={configuracion}>
      <LicenciasModuleContent
        initialFilters={{ gestionLicenciaId: gestionId }}
        hideTitle={true} // Ocultamos el título de la página "Licencias Médicas"
        hideFilters={true} // Ocultamos la barra de filtros, ya estamos en un expediente específico
      />
    </FilterProvider>
  );
};

export default LicenciasTab;