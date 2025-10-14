import ConcliacionDetalle from '@/modules/conliliacion/ConciliacionDetalle';
import ConcliliacionGestion from '@/modules/conliliacion/ConciliacionGestion';


const conciliacionTabsConfig = [

  {
    key: 'gestion',
    label: 'Gestiones',
    component: <ConcliliacionGestion />,
    rolesAllowed: ['admin', 'trabajador',"cliente"],
  },

];

export default conciliacionTabsConfig;
