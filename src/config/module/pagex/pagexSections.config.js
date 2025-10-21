import pagexModules from "./pagexModules.config";

const modulesArray = Object.values(pagexModules);

const pagexSections = [
  {
    title: "Operación",
    items: modulesArray.filter(
      (mod) => mod.category === "operacion" && mod.visible !== false
    ),
  },
  {
    title: "Gestión",
    items: modulesArray.filter(
      (mod) => mod.category === "gestion" && mod.visible !== false
    ),
  },
];

export default pagexSections;
