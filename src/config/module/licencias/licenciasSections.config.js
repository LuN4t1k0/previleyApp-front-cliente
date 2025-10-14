
import licenciasModules from './licenciasModules.config';

const modulesArray = Object.values(licenciasModules);

const licenciasSections = [
  {
    title: "Administración",
    items: modulesArray.filter(
      (mod) => mod.category === "admin" && mod.visible !== false
    ),
  },
  {
    title: "Detalles",
    items: modulesArray.filter(
      (mod) => mod.category === "licencias" && mod.visible !== false
    ),
  },
];

export default licenciasSections;

