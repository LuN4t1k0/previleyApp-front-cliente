import moraSections from '@/config/module/mora/moraSections.config';
import HubShell from '@/components/shared/HubShell';

export default function MoraPresuntaPage() {
  return (
    <HubShell
      config={moraSections}
      title="Mora Presunta"
      icon="🧾"
      subtitle="Elige entre la gestión operativa o el dashboard analítico"
      showBack={true}
      theme="mora"
    />
  );
}
