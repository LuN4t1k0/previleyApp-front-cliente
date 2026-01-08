
import licenciasSections from '@/config/module/licencias/licenciasSections.config';
import HubShell from '@/components/shared/HubShell';

export default function LicenciasPage() {
  return (
    <HubShell
      config={licenciasSections}
      title="Licencias Médicas"
      icon="🏥"
      subtitle="Elige entre el dashboard global o el dashboard operativo."
      showBack={true}
      theme="licencias"
    />
  );
}
