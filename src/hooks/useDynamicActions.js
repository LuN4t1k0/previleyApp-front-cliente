
import { useMemo } from 'react';
import cloneDeep from 'lodash.clonedeep';

const useDynamicActions = (config, isEnabled) => {
  return useMemo(() => {
    if (!config || !config.columnsConfig) {
      return config;
    }

    const newConfig = cloneDeep(config);

    // --- PRUEBA DEFINITIVA ---
    // 1. VAMOS A VER EL ARRAY EXACTO QUE ESTÁ SIENDO REVISADO
    console.log("%c🔍 Array a buscar:", 'color: blue; font-weight: bold;', newConfig.columnsConfig);

    const actionsColumn = newConfig.columnsConfig.find(col => col.type === 'actions');

    // 2. VAMOS A VER EL RESULTADO EXACTO DE LA BÚSQUEDA
    console.log("%c🎯 Resultado de la búsqueda (.find):", 'color: blue; font-weight: bold;', actionsColumn);
    // --- FIN DE LA PRUEBA ---

    if (!actionsColumn || !actionsColumn.actions) {
      console.error("❌ Búsqueda fallida. No se encontró una columna con type: 'actions'. El hook se detendrá.");
      return newConfig;
    }

    actionsColumn.actions.forEach((action) => {
      const originalVisibleWhen = action.visibleWhen;
      action.visibleWhen = (rowData) => {
        const decisionGeneral = isEnabled;
        const decisionDeFila = originalVisibleWhen ? originalVisibleWhen(rowData) : true;
        const decisionFinal = decisionGeneral && decisionDeFila;

        if (action.id === 'editar') {
          console.log(
            `%c🔬 Analizando Visibilidad (Fila ID: ${rowData.id}) 🔬`,
            'color: white; background-color: #28a745; padding: 4px; border-radius: 4px;',
            {
              "Decisión General (isEnabled)": decisionGeneral,
              "Estado de esta Fila (licencia)": rowData.estadoLicencia,
              "Estado de esta Fila (genérico)": rowData.estado,
              "Decisión de Fila (visibleWhen)": decisionDeFila,
              "DECISIÓN FINAL ➡️": decisionFinal ? "MOSTRAR ✅" : "OCULTAR ❌",
            }
          );
        }
        
        return decisionFinal;
      };
    });

    return newConfig;
  }, [config, isEnabled]);
};

export default useDynamicActions;