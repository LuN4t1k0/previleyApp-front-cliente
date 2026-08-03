const MORA_GESTIONES_PATH = "/servicios/mora-presunta/gestiones";

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

const normalizeType = (value) => String(value || "").trim().toLowerCase();

const getActionUrl = (notification, metadata) =>
  firstValue(notification?.actionUrl, metadata?.actionUrl, metadata?.path, metadata?.href);

const isMoraActionUrl = (href) => {
  if (!href) return false;
  try {
    const url = new URL(String(href), "http://previley.local");
    return url.pathname.includes("/mora-presunta");
  } catch (_) {
    return String(href).includes("mora-presunta");
  }
};

const isMoraNotification = (notification, metadata) =>
  Boolean(
    metadata?.gestionMoraId ||
      metadata?.gestionId ||
      metadata?.moraId ||
      normalizeType(metadata?.gestionTipo) === "gestion_mora" ||
      normalizeType(metadata?.origen) === "gestion_mora" ||
      ["gestion_mora", "solicitud_mora"].includes(normalizeType(notification?.entityType)) ||
      normalizeType(notification?.relatedEntityType) === "gestion_mora" ||
      normalizeType(notification?.type).startsWith("gestion_mora") ||
      isMoraActionUrl(getActionUrl(notification, metadata))
  );

const buildMoraGestionHref = (notification, metadata) => {
  const actionUrl = getActionUrl(notification, metadata);
  const legacyParams = new URLSearchParams();
  if (actionUrl) {
    try {
      const url = new URL(String(actionUrl), "http://previley.local");
      url.searchParams.forEach((value, key) => legacyParams.set(key, value));
    } catch (_) {}
  }
  const gestionId = firstValue(
    metadata?.gestionMoraId,
    metadata?.gestionId,
    metadata?.moraId,
    legacyParams.get("gestionId"),
    legacyParams.get("gestionMoraId"),
    normalizeType(notification?.relatedEntityType) === "gestion_mora"
      ? notification.relatedEntityId
      : null,
    normalizeType(notification?.entityType) === "gestion_mora" ? notification.entityId : null
  );

  const params = new URLSearchParams();
  if (gestionId) params.set("gestionId", String(gestionId));
  const empresaRut = firstValue(
    metadata?.empresaRut,
    notification?.empresaRut,
    legacyParams.get("empresaRut")
  );
  const solicitudId = firstValue(
    metadata?.solicitudMoraId,
    metadata?.solicitudId,
    legacyParams.get("solicitudId"),
    legacyParams.get("solicitudMoraId"),
    normalizeType(notification?.entityType) === "solicitud_mora" ? notification.entityId : null
  );
  const folio = firstValue(
    metadata?.folio,
    metadata?.gestionFolio,
    legacyParams.get("folio"),
    legacyParams.get("gestionFolio")
  );

  if (empresaRut) params.set("empresaRut", String(empresaRut));
  if (solicitudId) params.set("solicitudId", String(solicitudId));
  if (folio && !gestionId) params.set("folio", String(folio));

  if (!params.toString()) return isMoraActionUrl(actionUrl) ? MORA_GESTIONES_PATH : null;

  return `${MORA_GESTIONES_PATH}?${params.toString()}`;
};

export const getNotificationHref = (notification) => {
  const metadata = notification?.metadata || {};
  const moraHref = isMoraNotification(notification, metadata)
    ? buildMoraGestionHref(notification, metadata)
    : null;

  if (moraHref) return moraHref;

  return getActionUrl(notification, metadata) || null;
};
