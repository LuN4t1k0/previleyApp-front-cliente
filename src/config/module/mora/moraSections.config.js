import moraModules from './moraModules.config';

const modulesArray = Object.values(moraModules);

const moraSections = [
  {
    title: 'Gestión',
    items: modulesArray.filter((mod) => mod.category === 'gestion' && mod.visible !== false),
  },
  {
    title: 'Análisis',
    items: modulesArray.filter((mod) => mod.category === 'analitica' && mod.visible !== false),
  },
];

export default moraSections;
