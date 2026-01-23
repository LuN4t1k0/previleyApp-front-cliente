export const CLIENT_SERVICE_DEFINITIONS = {
  mora: {
    key: "mora",
    slug: "mora-presunta",
    label: "Mora Presunta",
    description:
      "Seguimiento de deuda previsional, recuperaciones y avances del proceso de regularización.",
    icon: "📦",
    keywords: ["mora", "regularización"],
  },
  pagex: {
    key: "pagex",
    slug: "pagos-en-exceso",
    label: "Pagos en Exceso",
    description:
      "Control de solicitudes, estados y montos recuperados por pagos previsionales en exceso.",
    icon: "💸",
    keywords: ["pagos en exceso", "pago en exceso", "pagex"],
  },
  licencias: {
    key: "licencias",
    slug: "licencias-medicas",
    label: "Licencias Médicas",
    description:
      "Visibilidad de licencias, anticipos y subsidios, junto con tasas de rechazo y tendencias.",
    icon: "🏥",
    keywords: [
      "licencia",
      "licencias medicas",
      "conciliacion de licencias medicas",
      "conciliacion licencias medicas",
      "anticipos",
      "subsidios",
      "reembolso sil",
    ],
  },
  pagosPrevisionales: {
    key: "pagos-previsionales",
    slug: "pagos-previsionales",
    label: "Pagos Previsionales",
    description:
      "Gestión y validación de pagos previsionales mensuales.",
    icon: "📥",
    keywords: ["pagos previsionales", "pagos previsional"],
  },
  cargasFamiliares: {
    key: "cargas-familiares",
    slug: "cargas-familiares",
    label: "Cargas Familiares",
    description:
      "Administración y revisión de cargas familiares.",
    icon: "👨‍👩‍👧‍👦",
    keywords: ["cargas familiares", "carga familiar"],
  },
  depositosConvenidos: {
    key: "depositos-convenidos",
    slug: "depositos-convenidos",
    label: "Depósitos Convenidos",
    description:
      "Seguimiento y conciliación de depósitos previsionales convenidos.",
    icon: "🏦",
    keywords: ["depositos convenidos", "depósitos convenidos"],
  },
  notificacionesPrevisionales: {
    key: "notificaciones-previsionales",
    slug: "notificaciones-previsionales",
    label: "Notificaciones Previsionales",
    description:
      "Seguimiento y gestión de notificaciones previsionales.",
    icon: "📣",
    keywords: ["notificaciones previsionales", "notificacion previsional"],
  },
  funes: {
    key: "funes",
    slug: "funes",
    label: "FUNES",
    description:
      "Gestión del Fondo Único de Enfermedades de Salud.",
    icon: "🧬",
    keywords: ["funes", "fondo unico", "fondo único"],
  },
};

const keywordMatcher = (name = "") => {
  const lower = name.toLowerCase();
  return Object.values(CLIENT_SERVICE_DEFINITIONS).find((service) =>
    service.keywords.some((keyword) => lower.includes(keyword))
  );
};

export const resolveServiceDefinition = (keyOrName) => {
  if (!keyOrName) return null;

  const normalizedKey = String(keyOrName).toLowerCase();
  const directMatch =
    CLIENT_SERVICE_DEFINITIONS[normalizedKey] ||
    Object.values(CLIENT_SERVICE_DEFINITIONS).find(
      (service) => service.slug === normalizedKey
    );

  if (directMatch) {
    return directMatch;
  }

  return keywordMatcher(normalizedKey);
};

export const resolveServiceKeyFromName = (name) => {
  const match = keywordMatcher(name);
  return match?.key || null;
};

export const listClientServices = () =>
  Object.values(CLIENT_SERVICE_DEFINITIONS);
