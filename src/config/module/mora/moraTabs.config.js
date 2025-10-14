
import MorasPresuntasGestion from '@/modules/morasPresuntas/MorasPresuntasGestion';
import MoraOperativaDashboard from '@/modules/morasPresuntas/MoraOperativaDashboard';

const moraTabsConfig = [
  // {
  //   key: 'dashboard',
  //   label: 'Dashboard Analítico',
  //   component: <MoraPresuntaDashboard />,
  //   rolesAllowed: ['admin', 'cliente',],
  // },
  {
    key: 'dashboard-operativo',
    label: 'Dashboard Operativo',
    component: <MoraOperativaDashboard />,
    rolesAllowed: ['admin', 'trabajador'],
  },
  {
    key: 'gestion',
    label: 'Gestión de Mora',
    component: <MorasPresuntasGestion />,
    rolesAllowed: ['admin', 'trabajador', 'cliente'],
  },
  // {
  //   key: 'detalle',
  //   label: 'Detalle Gesiones',
  //   component: <MorasPresuntasDetalle />,
  //   rolesAllowed: ['admin', 'trabajador',"cliente"],
  // },
];

export default moraTabsConfig;
