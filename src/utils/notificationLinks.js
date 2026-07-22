const MORA_GESTIONES_PATH = "/servicios/mora-presunta/gestiones";

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

const isMoraNotification = (notification, metadata) =>
  Boolean(
    metadata?.gestionMoraId ||
      metadata?.gestionId ||
      metadata?.moraId ||
      notification?.entityType === "gestion_mora" ||
      notification?.relatedEntityType === "gestion_mora" ||
      notification?.type?.startsWith?.("gestion_mora")
  );

const buildMoraGestionHref = (notification, metadata) => {
  const gestionId = firstValue(
    metadata?.gestionMoraId,
    metadata?.gestionId,
    metadata?.moraId,
    notification?.relatedEntityType === "gestion_mora" ? notification.relatedEntityId : null,
    notification?.entityType === "gestion_mora" ? notification.entityId : null
  );

  if (!gestionId) return null;

  const params = new URLSearchParams({ gestionId: String(gestionId) });
  const empresaRut = firstValue(metadata?.empresaRut, notification?.empresaRut);
  const solicitudId = firstValue(
    metadata?.solicitudMoraId,
    metadata?.solicitudId,
    notification?.entityType === "solicitud_mora" ? notification.entityId : null
  );

  if (empresaRut) params.set("empresaRut", String(empresaRut));
  if (solicitudId) params.set("solicitudId", String(solicitudId));

  return `${MORA_GESTIONES_PATH}?${params.toString()}`;
};

export const getNotificationHref = (notification) => {
  const metadata = notification?.metadata || {};
  const moraHref = isMoraNotification(notification, metadata)
    ? buildMoraGestionHref(notification, metadata)
    : null;

  if (moraHref) return moraHref;

  return notification?.actionUrl || metadata.actionUrl || metadata.path || metadata.href || null;
};
