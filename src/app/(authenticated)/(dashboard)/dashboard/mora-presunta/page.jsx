import moraSections from '@/config/module/mora/moraSections.config';
import HubShell from '@/components/shared/HubShell';

export default function MoraPresuntaPage() {
  return (
    <HubShell
      config={moraSections}
      title="Mora Presunta"
      icon="🧾"
      subtitle="Elige entre el dashboard global o el dashboard operativo."
      showBack={true}
      theme="mora"
    />
  );
}
