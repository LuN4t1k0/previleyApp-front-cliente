import LicenciasLegacyRedirect from "@/modules/licencias/LicenciasLegacyRedirect";

export default function Page({ searchParams }) {
  return <LicenciasLegacyRedirect pathname="/licencia-medica/conciliacion" searchParams={searchParams} />;
}
