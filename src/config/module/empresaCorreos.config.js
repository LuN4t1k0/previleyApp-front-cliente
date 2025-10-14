import GenericModal from "@/components/modal/GenericModal";
import EmpresaCorreoFormModal from "@/components/modal/empresa/EmpresaCorreoFormModal";
import { RiEditLine, RiDeleteBinLine, RiAddLine } from "@remixicon/react";

const EmpresaCorreosConfig = {
  // API
  resourcePath: "/empresa-correos",
  deletePath: "/empresa-correos",
  updatePath: "/empresa-correos",
  createPath: "/empresa-correos",
  bulkDeletePath: "/empresa-correos/bulk-delete",
  filtersPath: "/empresa-correos/filters",
  detailPath: "/empresa-correos", // no usamos detalle específico

  // UI
  title: "Correos por Empresa",
  subtitle: "Administra los correos asociados a cada empresa (facturación, cobranza, general).",
  useInfiniteScroll: true,

  filters: [
    { key: "empresaRut", type: "multiselect", field: "empresaRut", placeholder: "Empresa...", options: "empresaRut" },
    { key: "tipo", type: "multiselect", field: "tipo", placeholder: "Tipo...", options: "tipo" },
    { key: "email", type: "text", field: "email", placeholder: "Correo..." },
    { key: "cargo", type: "text", field: "cargo", placeholder: "Cargo..." },
  ],

  excludeColumns: ["updatedAt"],
  monetaryColumns: [],
  dateColumns: ["createdAt"],

  columnsConfig: [
    { header: "Empresa", accessorKey: "nombreEmpresa" },
    { header: "RUT", accessorKey: "empresaRut" },
    { header: "Email", accessorKey: "email" },
    { header: "Contacto", accessorKey: "nombreContacto" },
    { header: "Teléfono", accessorKey: "telefono" },
    { header: "Cargo", accessorKey: "cargo" },
    { header: "Tipo", accessorKey: "tipo" },
    {
      header: "Acciones",
      accessorKey: "acciones",
      type: "actions",
      actions: [
        {
          id: "editar",
          label: "Editar",
          icon: RiEditLine,
          iconClass: "text-blue-600",
          rolesAllowed: ["admin"],
        },
        {
          id: "eliminar",
          label: "Eliminar",
          icon: RiDeleteBinLine,
          iconClass: "text-red-600",
          rolesAllowed: ["admin"],
        },
      ],
    },
  ],

  columnOrder: [
    "nombreEmpresa",
    "empresaRut",
    "email",
    "nombreContacto",
    "telefono",
    "cargo",
    "tipo",
    "acciones",
  ],

  modalsConfig: {
    crearEditar: {
      component: GenericModal,
      title: "Agregar/Editar correo de empresa",
      content: EmpresaCorreoFormModal,
      rolesAllowed: ["admin"],
    },
  },

  actionsConfig: [
    {
      id: "nuevo",
      modalName: "crearEditar",
      buttonText: "Nuevo",
      rolesAllowed: ["admin"],
      actionType: "create",
      color: "blue",
      icon: "RiAddLine",
    },
  ],

  badgesConfig: {},
};

export default EmpresaCorreosConfig;
