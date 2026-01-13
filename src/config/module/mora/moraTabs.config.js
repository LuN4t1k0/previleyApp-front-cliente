
import MoraOperativaDashboard from '@/modules/morasPresuntas/MoraOperativaDashboard';
import MoraGlobalDashboard from '@/modules/morasPresuntas/MoraGlobalDashboard';
import MoraGestionesDashboard from '@/modules/morasPresuntas/MoraGestionesDashboard';

const moraTabsConfig = [
  // {
  //   key: 'dashboard',
  //   label: 'Dashboard Analítico',
  //   component: <MoraPresuntaDashboard />,
  //   rolesAllowed: ['admin', 'cliente',],
  // },
  {
    key: 'dashboard-global',
    label: 'Dashboard Global',
    component: <MoraGlobalDashboard />,
    rolesAllowed: ['cliente'],
  },
  {
    key: 'dashboard-operativo',
    label: 'Dashboard Operativo',
    component: <MoraOperativaDashboard />,
    rolesAllowed: ['cliente'],
  },
  {
    key: 'gestiones',
    label: 'Gestiones',
    component: <MoraGestionesDashboard />,
    rolesAllowed: ['cliente'],
  },
  // {
  //   key: 'detalle',
  //   label: 'Detalle Gesiones',
  //   component: <MorasPresuntasDetalle />,
  //   rolesAllowed: ['admin', 'trabajador',"cliente"],
  // },
];

export default moraTabsConfig;
