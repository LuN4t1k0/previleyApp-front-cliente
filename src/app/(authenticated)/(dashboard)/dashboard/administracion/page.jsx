// import adminSections from '@/config/module/adminSections.config';
// import AdminHub from '@/components/dashboard/admin/AdminHub';

// export default function AdministracionPage() {
//   return <AdminHub config={adminSections} />;
// }

import adminSections from '@/config/module/adminSections.config';
import HubShell from '@/components/shared/HubShell';

export default function AdministracionPage() {
  return (
    <HubShell
      config={adminSections}
      title="Administración"
      icon="🛠️"
      subtitle="Selecciona una sección del panel administrativo"
      showBack={true}
      theme="dashboard"
    />
  );
}
