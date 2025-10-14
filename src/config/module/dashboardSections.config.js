import dashboardModules from './dashboardModules.config';

const modulesArray = Object.values(dashboardModules);

// Agrupamos por categoría usando `category` y respetando `visible !== false`
const dashboardSections = [
  {
    title: "Administración",
    items: modulesArray.filter(
      (mod) => mod.category === "admin" && mod.visible !== false
    ),
  },
  {
    title: "Servicios",
    items: modulesArray.filter(
      (mod) => mod.category === "servicio" && mod.visible !== false
    ),
  },
];

export default dashboardSections;
