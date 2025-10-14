import AnticiposForm from "@/components/forms/AnticiposForm";
import AnularGestionForm from "@/components/forms/AnularGestionForm";
import CargaMasivaRealtime from "@/components/forms/CargaMasivaRealtime";
import ConciliacionForm from "@/components/forms/ConciliacionForm";
import LicenciasFormModal from "@/components/forms/LicenciasForm";
import SubsidioForm from "@/components/forms/SubsidioForm";
import DetalleGestionModal from "@/components/modal/conciliacion/DetalleGestionModal";
import GenericModal from "@/components/modal/GenericModal";
import LicenciaDetailsContent from "@/components/modal/LicenciaDetailsContent";
import AnularYReasignarWizard from "@/components/wizards/AnularYReasignarWizard";

import {
  RiLockUnlockLine,
  RiDeleteBinLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
} from "@remixicon/react";

const ESTADOS_TERMINALES = ["pre-facturada", "validado", "facturada", "pagada"];
const ESTADOS_INICIALES = ["pendiente"]; // Para acciones como validar/rechazar
const ESTADOS_REVERTIBLES = ["validado", "rechazada"]; // Para la acción de reabrir

const ConciliacionConfig = {
  // Rutas de la API
  createPath: "/gestion-licencia",
  updatePath: "/gestion-licencia",
  resourcePath: "/gestion-licencia",
  deletePath: "/gestion-licencia",
  filtersPath: "/gestion-licencia/filters",
  detailPath: "/gestion-licencia/detalle",
  bulkUploadPath: "/gestion-licencia/bulk-create",
  bulkUploadParentIdField: null, // o "usuarioId" si aplica
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  //  Centralizamos los permisos del módulo aquí
  permissions: {
    view: ["admin", "supervisor", "cliente", "previley", "trabajador"],
    create: ["admin", "supervisor", "trabajador"],
    edit: ["admin", "supervisor", "editor", "trabajador"],
    delete: ["admin", "supervisor", "editor", "trabajador"],
  },

  // Información de UI
  title: "Conciliación",
  subtitle: "Administra las conciliaciones generadas por los analistas.",

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

    {
      key: "estadoLicencia",
      type: "multiselect",
      field: "estadoLicencia",
      placeholder: "Estado de Licencia...",
      options: "estadoLicencia",
      // Si tu backend devuelve "estadosLicencia", usa esa cadena
    },
    {
      key: "entidad",
      type: "multiselect",
      field: "entidad",
      placeholder: "Entidad...",
      options: "entidad",
    },
    {
      key: "tipoLicencia",
      type: "multiselect",
      field: "tipoLicencia",
      placeholder: "Tipo de Licencia...",
      options: "tipoLicencia",
    },
  ],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: [
   "createdAt","updatedAt","id","totalSubsidiosMesOnScope","totalSubsidiosMesOffScope","carryOutGestion"
  ],

  // Columnas a formatear como moneda
  monetaryColumns: ["totalSubsidiosMesFacturables"], // Añade las columnas que necesites
  // Columnas a formatear como fecha
  dateColumns: ["fechaOtorgamiento", "fechaTermino", "fechaInicio"], // Añade las columnas que necesites
  // Añadir configuración de las columnas ordenables:
  
  periodoColumns: ["periodo"],
  
  // columnsConfig: [
  //   {
  //     header: "Monto Conciliado",
  //     accessorKey: "totalSubsidiosMesFacturables",
  //   },
   
  //   {
  //     header: "Acciones",
  //     accessorKey: "acciones",
  //     type: "actions",
  //     actions: [
  //       {
  //         id: "validar",
  //         icon: RiCheckLine,
  //         label: "Validar", // O "Aprobar"
  //         iconClass: "text-green-500",
  //         rolesAllowed: ["admin"],
  //         // Lógica: Solo visible en estados iniciales.
  //         visibleWhen: (rowData) =>
  //           rowData.estadoLicencia &&
  //           ESTADOS_INICIALES.includes(rowData.estadoLicencia.toLowerCase()),
  //       },
  //       {
  //         id: "rechazar",
  //         icon: RiCloseLine,
  //         label: "Rechazar",
  //         iconClass: "text-red-500",
  //         rolesAllowed: ["admin"],
  //         // Lógica: También visible solo en estados iniciales.
  //         visibleWhen: (rowData) =>
  //           rowData.estadoLicencia &&
  //           ESTADOS_INICIALES.includes(rowData.estadoLicencia.toLowerCase()),
  //       },
  //       {
  //         id: "revertir",
  //         icon: RiLockUnlockLine,
  //         label: "Reabrir",
  //         iconClass: "text-yellow-500",
  //         rolesAllowed: ["admin"],
  //         // Lógica: Visible solo en los estados que definimos como revertibles.
  //         visibleWhen: (rowData) =>
  //           rowData.estadoLicencia &&
  //           ESTADOS_REVERTIBLES.includes(rowData.estadoLicencia.toLowerCase()),
  //       },
  //       {
  //         id: "editar",
  //         icon: RiEditLine,
  //         label: "editar",
  //         iconClass: "text-blue-600",
  //         rolesAllowed: ["admin", "editor", "trabajador"],
  //         // Lógica: Visible si el estado NO es un estado terminal.
  //         visibleWhen: (rowData) =>
  //           rowData.estado &&
  //           !ESTADOS_TERMINALES.includes(rowData.estado.toLowerCase()),
  //       },
  //       {
  //         id: "eliminar",
  //         icon: RiDeleteBinLine,
  //         label: "Eliminar",
  //         iconClass: "text-red-600",
  //         rolesAllowed: ["admin", "editor", "trabajador"],
  //         // Lógica: Misma que modificar, visible si el estado NO es terminal.
  //         // Si tienes una regla más estricta (ej: solo en "pendiente"), puedes cambiarla a:
  //         // ESTADOS_INICIALES.includes(rowData.estadoLicencia.toLowerCase())
  //         visibleWhen: (rowData) =>
  //           rowData.estado &&
  //           !ESTADOS_TERMINALES.includes(rowData.estado.toLowerCase()),
  //       },
  //     ],
  //   },
  // ],

  // Orden personalizado de las columnas
  
  columnsConfig: [
    { header: "Monto Conciliado", accessorKey: "totalSubsidiosMesFacturables" },
    {
      header: "Acciones",
      accessorKey: "acciones",
      type: "actions",
      actions: [
        {
          id: "verDetalle",
          icon: RiEditLine,
          label: "Administrar Gestión",
          iconClass: "text-blue-600",
          rolesAllowed: ["admin", "supervisor", "trabajador"],
          visibleWhen: () => true,
        },
        {
          id: "editar",
          icon: RiEditLine,
          label: "Editar",
          rolesAllowed: ["admin", "supervisor", "trabajador"],
          visibleWhen: (rowData) => ['pendiente', 'reabierta'].includes(rowData.estado),
        },
        {
          id: "eliminar",
          icon: RiEditLine,
          label: "Eliminar",
          iconClass: "text-red-600",
          rolesAllowed: ["admin", "supervisor", "trabajador"],
          visibleWhen: (rowData) => ['pendiente', 'reabierta'].includes(rowData.estado),
        },
      ],
    },
  ],
  
  
  
  
  columnOrder: ["gestionLicenciaId", "folio"],

  // revisarFechaVencimiento
  revisarFechaVencimiento: [],

  // Configuración de modales
  // modalsConfig: {
  //   crearEditar: {
  //     component: GenericModal,
  //     title: "Agregar/Editar",
  //     content: ConciliacionForm,
  //     rolesAllowed: ["trabajador", "admin"],
  //   },

  //   detalle: {
  //     component: GenericModal,
  //     title: "Detalle",
  //     content: LicenciaDetailsContent,
  //     rolesAllowed: ["admin", "trabajador", "editor"],
  //   },

  //   // rejectProduccion: {
  //   //   component: GenericModal,
  //   //   title: "Rechazar Producción",
  //   //   content: LicenciaForm,
  //   //   rolesAllowed: ["admin", "editor"],
  //   // },
  // },

  // --- CONFIGURACIÓN DE MODALES AMPLIADA ---
  modalsConfig: {
    crearEditar: {
      component: GenericModal,
      title: "Crear/Editar Gestión",
      content: ConciliacionForm,
      rolesAllowed: ["trabajador", "supervisor", "admin"],
    },
    // --- NUEVO MODAL "CENTRO DE OPERACIONES" ---
    detalleGestion: {
      component: DetalleGestionModal, // Usa un componente personalizado, no el genérico
      title: "Administrar Gestión de Licencias",
      size: '3xl', // Hacemos el modal más grande para que quepa todo
      rolesAllowed: ["admin", "supervisor", "trabajador"],
    },
    // --- NUEVO MODAL REUTILIZABLE PARA CARGA DE ARCHIVOS ---
    cargaMasiva: {
      component: GenericModal,
      title: "Cargar Archivo",
      content: CargaMasivaRealtime,
      rolesAllowed: ["admin", "trabajador"],
    },

    // --- MODALES QUE FALTABAN POR REGISTRAR ---
    anularGestion: {
        component: GenericModal,
        title: "Anular Gestión",
        content: AnularGestionForm,
        rolesAllowed: ["admin", "supervisor", "trabajador"],
    },

    anularYReasignar: {
        component: GenericModal, // Usamos el genérico como "cáscara"
        title: "Asistente para Anular y Reasignar Gestión",
        content: AnularYReasignarWizard, // El wizard es el contenido
        size: '2xl', // Un tamaño intermedio para el wizard
        rolesAllowed: ["admin", "supervisor", "trabajador"],
    },

    // --- AÑADIR NUEVOS MODALES DE EDICIÓN ---
        editarLicencia: {
            component: GenericModal,
            title: "Editar Licencia Médica",
            content: LicenciasFormModal,
        rolesAllowed: ["admin", "supervisor", "trabajador"],
        },
        editarAnticipo: {
            component: GenericModal,
            title: "Editar Anticipo",
            content: AnticiposForm,
            rolesAllowed: ["admin", "trabajador"],
        },
        editarSubsidio: {
            component: GenericModal,
            title: "Editar Subsidio",
            content: SubsidioForm,
            rolesAllowed: ["admin", "trabajador"],
        },
    // (Aquí añadiremos los modales de anular/reabrir más adelante)
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
    estado: {
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

export default ConciliacionConfig;
