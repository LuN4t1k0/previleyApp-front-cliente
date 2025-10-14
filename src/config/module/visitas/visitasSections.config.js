import visitasModules from "./visitasModules.config";

const modulesArray = Object.values(visitasModules);

const visitasSections = [
  {
    title: "Operación",
    items: modulesArray.filter(
      (module) => module.category === "operacion" && module.visible !== false
    ),
  },
  {
    title: "Gestión",
    items: modulesArray.filter(
      (module) => module.category === "gestion" && module.visible !== false
    ),
  },
  {
    title: "Análisis",
    items: modulesArray.filter(
      (module) => module.category === "analitica" && module.visible !== false
    ),
  },
];

export default visitasSections;
