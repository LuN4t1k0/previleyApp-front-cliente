import { redirect } from "next/navigation";
import { resolveLicenciasLegacyRouteHref } from "@/services/licenciasWorkspace.mjs";

const LicenciasLegacyRedirect = ({ pathname, searchParams = {} }) => {
  const destination = resolveLicenciasLegacyRouteHref(pathname, searchParams);
  redirect(destination || "/servicios/licencias-medicas");
};

export default LicenciasLegacyRedirect;
