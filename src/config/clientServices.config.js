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
    keywords: ["pagos en exceso", "pagex"],
  },
  licencias: {
    key: "licencias",
    slug: "licencias-medicas",
    label: "Licencias Médicas",
    description:
      "Visibilidad de licencias, anticipos y subsidios, junto con tasas de rechazo y tendencias.",
    icon: "🏥",
    keywords: ["licencia", "licencias médicas"],
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
