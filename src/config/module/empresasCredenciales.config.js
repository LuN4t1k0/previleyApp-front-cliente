import EditarCredencialModal from "@/components/modal/credenciales/EditarCredencialModal";
import EmpresaCredencialesModal from "@/components/modal/credenciales/EmpresaCredencialesModal";
import GenericModal from "@/components/modal/GenericModal";


import { RiDeleteBinLine, RiEditLine } from "@remixicon/react";

const ContratosServicios = {
  // Rutas de la API
  createPath: "/empresa-credenciales/",
  updatePath: "/empresa-credenciales/",
  resourcePath: "/empresa-credenciales/",
  deletePath: "/empresa-credenciales/",
  filtersPath: "/empresa-credenciales/filters",
  detailPath: "/empresa-credenciales/detalle",
  bulkUploadPath: "",
  bulkUploadParentIdField: "",
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: "Credenciales",
  subtitle: "Administra todas las credenciales registradas en PrevileyAPP.",

  // Definición de los filtros y su mapeo a los parámetros de consulta

filters: [
  {
    key: "empresaRut",
    type: "multiselect",
    field: "empresaRut",
    placeholder: "Empresa...",
    options: "empresaRut", // <- debe coincidir con la clave del backend
  },
  {
    key: "entidad",
    type: "multiselect",
    field: "entidad",
    placeholder: "Entidad...",
    options: "entidad",
  },
  {
    key: "usuario",
    type: "text",
    field: "usuario",
    placeholder: "Usuario asociado...",
  },
],

  // Orden personalizado de las columnas
  columnOrder: [],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: ["id", "servicioId","createdAt", "updatedAt"],

  // Columnas a formatear como moneda
  monetaryColumns: [], // Añade las columnas que necesites

  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
    {
      header: "Acciones",
      accessorKey: "acciones",
      type: "actions",
      actions: [
        {
          id: "editar",
          icon: RiEditLine,
          label: "Editar",
          iconClass: "text-blue-600",
          rolesAllowed: ["admin", "editor", "trabajador"],
        },
        {
          id: "eliminar",
          icon: RiDeleteBinLine,
          label: "Eliminar",
          iconClass: "text-red-600",
          rolesAllowed: ["admin", "editor", "trabajador"],
        },
      ],
    },
  ],

  // Columnas a formatear como fecha
  dateColumns: [], // Añade las columnas que necesites

  // Configuración de badges
  badgesConfig: {},

  // Configuración de modales
  modalsConfig: {
    asignarServiciosForm: {
      component: GenericModal,
      title: "Agregar/Editar Producion",
      content: EmpresaCredencialesModal,
      rolesAllowed: ["admin",],
    },
    editar: {
      component: GenericModal,
      title: "Agregar/Editar Producion",
      content: EditarCredencialModal,
      rolesAllowed: ["admin",],
    },
  },
  actionsConfig: [
    {
      id: "nuevo",
      buttonText: " Nueva Credencial",
      rolesAllowed: ["admin",],
      actionType: "create",
      color: "blue",
      icon: "RiFileAddFill",
    },

    
  ],
};

export default ContratosServicios;
