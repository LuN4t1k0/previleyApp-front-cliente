
import LicenciasLegacyRedirect from "@/modules/licencias/LicenciasLegacyRedirect";

export default function Page({ searchParams }) {
  return <LicenciasLegacyRedirect pathname="/dashboard/licencia-medica" searchParams={searchParams} />;
}
