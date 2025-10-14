
import licenciasSections from '@/config/module/licencias/licenciasSections.config';
import HubShell from '@/components/shared/HubShell';

export default function LicenciasPage() {
  return (
    <HubShell
      config={licenciasSections}
      title="Licencias Médicas"
      icon="🏥"
      subtitle="Selecciona una sección relacionada con licencias"
      showBack={true}
      theme="licencias"
    />
  );
}
