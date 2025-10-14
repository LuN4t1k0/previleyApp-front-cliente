// NUEVO:
import LicenciasFormModal from "@/components/forms/LicenciasForm";
import GenericModal from "@/components/modal/GenericModal";
import LicenciaDetailsContent from "@/components/modal/LicenciaDetailsContent";

import {
  RiFilePdf2Line,
  RiLockUnlockLine,
  RiDeleteBinLine,
  RiEditLine,
  RiFileExcel2Line,
  RiCheckLine,
  RiCloseLine,
} from "@remixicon/react";


const LicenciasMedicasConfig = {
  // Rutas de la API
  createPath: "/licencias-medicas/",
  updatePath: "/licencias-medicas",
  resourcePath: "/licencias-medicas/",
  deletePath: "/licencias-medicas/",
  filtersPath: "/licencias-medicas/filters",
  detailPath: "/licencias-medicas/detalle",
  bulkUploadPath: "/licencias-medicas/bulk-create",
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
  title: "Licencias Médicas",
  subtitle: "Administra las licencias médicas generadas por los analistas.",

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
    "createdAt",
    "updatedAt",
    "motivoAnulacion",
    "motivoRechazo",
    "motivoDevolucion",
    "sucursal",
    "origen",
    "telefonoTrabajador",
    "edadTrabajador",
    "sexoTrabajador",
    "fechaContratoTrabajo",
    "fechaPrimeraAfiliacion",
    "nombreProfesional",
    "profesionalRut",
    "direccionProfesional",
    "telefonoProfesional",
    "especialidad",
    "lugarReposo",
    "direccionReposo",
    "empleador",
    "fechaUltimaModificacion",
    "fechaRecepcion",
    "monto",
    "id",
    "fechaOtorgamiento",
    "gestionLicenciaOrigenId"
  ],

  // Columnas a formatear como moneda
  monetaryColumns: ["montoAnticipo", "montoSubsidio", "montoDiferencia"], // Añade las columnas que necesites
  // Columnas a formatear como fecha
  dateColumns: ["fechaOtorgamiento", "fechaTermino", "fechaInicio"], // Añade las columnas que necesites
  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
    {
      header: "Anticipo",
      accessorKey: "montoAnticipo",
    },
    {
      header: "Subsidio",
      accessorKey: "montoSubsidio",
    },
    {
      header: "Diferencia",
      accessorKey: "montoDiferencia",
    },

    {
      header: "Gestion",
      accessorKey: "gestionLicenciaId",
    },

    {
      header: "Fecha",
      accessorKey: "fechaOtorgamiento",
    },

    {
      header: "Tipo",
      accessorKey: "tipoLicencia",
    },

    {
      header: "RUT",
      accessorKey: "trabajadorRut",
    },

    {
      header: "NOMBRE",
      accessorKey: "nombreTrabajador",
    },

    {
      header: "REPOSO",
      accessorKey: "tipoReposo",
    },

    {
      header: "ESTADO",
      accessorKey: "estadoLicencia",
    },

    {
      header: "INICIO",
      accessorKey: "fechaInicio",
    },

    {
      header: "TERMINO",
      accessorKey: "fechaTermino",
    },

    {
      header: "DÍAS",
      accessorKey: "numeroDias",
    },


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
          // rolesAllowed: ["admin", "editor", "trabajador"],
          // Lógica: Visible si el estado NO es un estado terminal.
          // visibleWhen: (rowData) =>
          //   rowData.estadoLicencia &&
          //   !ESTADOS_TERMINALES.includes(rowData.estadoLicencia.toLowerCase()),
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
      title: "Formulario de Licencias",
      content: LicenciasFormModal,
      rolesAllowed: ["trabajador", "admin"],
    },

    detalle: {
      component: GenericModal,
      title: "Detalle",
      content: LicenciaDetailsContent,
      rolesAllowed: ["admin", "trabajador", "editor"],
    },

    // rejectProduccion: {
    //   component: GenericModal,
    //   title: "Rechazar Producción",
    //   content: LicenciaForm,
    //   rolesAllowed: ["admin", "editor"],
    // },
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

export default LicenciasMedicasConfig;
