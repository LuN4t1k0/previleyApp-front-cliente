// NUEVO:

import SubsidioForm from "@/components/forms/SubsidioForm";
import GenericModal from "@/components/modal/GenericModal";


import {

  RiDeleteBinLine,
  RiEditLine,

} from "@remixicon/react";

const ESTADOS_TERMINALES = ["pre-facturada", "validado", "facturada", "pagada"];
const ESTADOS_INICIALES = ["pendiente"]; // Para acciones como validar/rechazar
const ESTADOS_REVERTIBLES = ["validado", "rechazada"]; // Para la acción de reabrir

const SubsidiosConfig = {
  // Rutas de la API
  createPath: "/subsidios",
  updatePath: "/subsidios",
  resourcePath: "/subsidios",
  deletePath: "/subsidios",
  filtersPath: "/subsidios/filters",
  detailPath: "/subsidios/detalle",
  bulkUploadPath: "/subsidios/bulk-create",
  bulkUploadParentIdField: null, // o "usuarioId" si aplica
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  //  Centralizamos los permisos del módulo aquí
  permissions: {
    view: ["admin", "cliente", "previley", "trabajador"],
    create: ["admin", "trabajador"],
    edit: ["admin", "editor", "trabajador"],
    delete: ["admin", "editor", "trabajador"],
  },

  // Información de UI
  title: "Subsidios",
  subtitle: "Administra los subsidios generados por los analistas.",

  // useInfiniteScroll: true, // Habilitar scroll infinito
  useInfiniteScroll: true,
  // Definición de los filtros y su mapeo a los parámetros de consulta
  filters: [
    {
      key: "empresaRut",
      type: "multiselect",
      field: "empresaRut",
      placeholder: "Empresa...",
      options: "empresaRut",
      // ⬆️ Debe coincidir con la propiedad en /filters
      // Si tu backend devuelve "empresas", usa "empresas"
    },
    {
      key: "folio",
      type: "text",
      field: "folio",
      placeholder: "Folio...",
      options: null, // text no necesita
    },
    {
      key: "trabajadorRut",
      type: "text",
      field: "trabajadorRut",
      placeholder: "RUT trabajador...",
      options: null,
    },

    // --- AÑADIDO: Filtro por número de documento ---
    {
      key: "numeroDocumento",
      type: "text",
      field: "numeroDocumento",
      placeholder: "Nº Documento...",
      options: null,
    },
    // --- AÑADIDO: Filtro por forma de pago ---
    {
      key: "formaPago",
      type: "multiselect",
      field: "formaPago",
      placeholder: "Forma de Pago...",
      options: "formaPago", // Debe coincidir con la 'key' del backend
    },
    // --- AÑADIDO: Filtro por rango de fechas ---
    {
      key: "fechaDeposito",
      type: "daterange", // Tu componente UI debe soportar este tipo
      field: "fechaDeposito",
      placeholder: "Fecha de Depósito...",
      options: null,
    },

  ],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: ["createdAt","updatedAt","id","produccionId","fechaProceso"],

  // Columnas a formatear como moneda
  monetaryColumns: ["montoDeposito","subsidio"], // Añade las columnas que necesites
  // Columnas a formatear como fecha
  dateColumns: ["fechaDeposito"], // Añade las columnas que necesites
  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
    {
      header: "Gestion",
      accessorKey: "gestionLicenciaId",
    },
    { header: "Folio", accessorKey: "folio" },
    { header: "Fecha Depósito", accessorKey: "fechaDeposito" },
    { header: "Monto Depósito", accessorKey: "montoDeposito" },
    { header: "Días Autorizados", accessorKey: "diasAutorizados" },
    { header: "Días Pagados", accessorKey: "diasPagados" },
    { header: "Forma Pago", accessorKey: "formaPago" },
    { header: "Nº Documento", accessorKey: "numeroDocumento" },
    { header: "Observaciones", accessorKey: "observaciones" },

    {
      header: "Acciones",
      accessorKey: "acciones",
      type: "actions",
      actions: [
        {
          id: "editar",
          icon: RiEditLine,
          label: "editar",
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

  // Orden personalizado de las columnas
  columnOrder: ["gestionLicenciaId", "folio"],

  // revisarFechaVencimiento
  revisarFechaVencimiento: [],

  // Configuración de modales
  modalsConfig: {
    crearEditar: {
      component: GenericModal,
      title: "Agregar/Editar Producción",
      content: SubsidioForm,
      rolesAllowed: ["trabajador", "admin"],
    },

   
  },

  actionsConfig: [
    {
      id: "nuevo",
      modalName: "crearEditar",
      buttonText: "Nuevo",
      rolesAllowed: ["trabajador", "admin"],
      actionType: "create",
      color: "blue",
      icon: "RiFileAddLine", // más liviano que `Fill`
    },
  ],

  badgesConfig: {
    // estado de la licencia: coincide con accessorKey: "estadoLicencia"
    estadoLicencia: {
      type: "status",
      variants: {
        // contempla ambas variantes de casing por si el backend varía
        validado: "indigo",
        VALIDADO: "indigo",
        pendiente: "warning",
        PENDIENTE: "warning",
        rechazada: "error",
        RECHAZADA: "error",
        corregida: "info",
        CORREGIDA: "info",
        facturada: "success",
        FACTURADA: "success",
        TRAMITE: "info",
        tramite: "info",
        "pre-facturada": "orange",
        "PRE-FACTURADA": "orange",
      },
    },

    // montos: coincide con accessorKey

    montoDiferencia: {
      type: "value",
      variants: { positive: "success", negative: "error", neutral: "neutral" },
    },

    // si REALMENTE tienes una columna 'rol' visible en esta tabla, déjala;
    // si no, puedes quitarla sin afectar otros módulos.
    rol: {
      type: "status",
      variants: {
        admin: "warning",
        previley: "default",
        cliente: "neutral",
      },
    },
  },
};

export default SubsidiosConfig;
