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
    ],
  },
  adml: {
    key: "adml",
    slug: "licencias-medicas",
    label: "Administración de Licencias Médicas",
    description:
      "Gestión operativa y seguimiento de licencias médicas.",
    icon: "🩺",
    keywords: ["adml", "administracion de licencias medicas"],
  },
  rsil: {
    key: "rsil",
    slug: "licencias-medicas",
    label: "Reembolso SIL",
    description:
      "Seguimiento de reembolsos SIL y conciliación de montos.",
    icon: "🧾",
    keywords: ["rsil", "reembolso sil"],
  },
  "mp-p": {
    key: "mp-p",
    slug: "mora-presunta",
    label: "Mora Presunta - Pago",
    description:
      "Casos de mora presunta asociados a pagos.",
    icon: "💳",
    keywords: ["mp-p", "mora presunta - pago", "mora presunta pago", "mora presunta - pagó"],
  },
  "mp-r": {
    key: "mp-r",
    slug: "mora-presunta",
    label: "Mora Presunta - Regularización",
    description:
      "Casos de mora presunta asociados a regularización.",
    icon: "✅",
    keywords: [
      "mp-r",
      "mora presunta - regularizacion",
      "mora presunta regularizacion",
      "mora presunta - regularización",
      "mora presunta regularización",
    ],
  },
  dc: {
    key: "dc",
    slug: "depositos-convenidos",
    label: "Depósitos Convenidos",
    description:
      "Seguimiento y conciliación de depósitos convenidos.",
    icon: "🏦",
    keywords: ["dc", "depositos convenidos", "depósitos convenidos"],
  },
  cf: {
    key: "cf",
    slug: "cargas-familiares",
    label: "Cargas Familiares",
    description:
      "Administración y seguimiento de cargas familiares.",
    icon: "👨‍👩‍👧‍👦",
    keywords: ["cf", "cargas familiares", "carga familiar"],
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
  zonasExtremas: {
    key: "zonas-extremas",
    slug: "zonas-extremas",
    label: "Zonas Extremas",
    description:
      "Seguimiento de solicitudes, trabajadores y montos asociados a bonificaciones de zonas extremas.",
    icon: "🧭",
    keywords: [
      "zonas extremas",
      "zona extrema",
      "z-ext",
      "ze",
      "bonificacion zonas extremas",
      "bonificación zonas extremas",
    ],
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
  const lower = name.toLowerCase().trim();
  const services = Object.values(CLIENT_SERVICE_DEFINITIONS);
  const exactMatch = services.find((service) =>
    service.keywords.some((keyword) => lower === keyword)
  );
  if (exactMatch) return exactMatch;
  const matches = services
    .map((service) => {
      const matched = service.keywords.find((keyword) =>
        lower.includes(keyword)
      );
      if (!matched) return null;
      return { service, keyword: matched };
    })
    .filter(Boolean);
  if (!matches.length) return null;
  matches.sort((a, b) => b.keyword.length - a.keyword.length);
  return matches[0].service;
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
