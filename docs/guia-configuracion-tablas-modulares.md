
# Guía de Configuración Modular: Tablas con Acciones y Modales (Mora Presunta)

Esta guía describe el uso de configuraciones modulares para tablas reusables en PrevileyAPP, especialmente en el contexto del módulo de Mora Presunta. Incluye detalles sobre configuración, generación de columnas, acciones, roles y buenas prácticas.

---

## 1. `generateColumns`: Firma y comportamiento

```js
generateColumns(
  fields,              // Campos detectados desde los datos
  handleEdit,          // Func. para edición
  handleDelete,        // Func. para eliminación
  excludeColumns,      // Columnas omitidas
  canEdit,             // Boolean: editar permitido
  canDelete,           // Boolean: eliminar permitido
  columnsConfig,       // Configuración de columnas personalizada
  actionHandlers,      // Diccionario de handlers por acción
  userRole,            // Rol actual
  columnOrder          // Orden personalizado de columnas
)
```

### Tipos soportados (`columnConfig.type`)

- `"link"` → Icono clickeable con link externo
- `"monetary"` → Formatea como pesos CLP
- `"date"` → Formatea como fecha chilena
- `"actions"` → Muestra botones por fila
- `undefined` → Celda plana sin formato

### Otras opciones en `columnsConfig`

- `rolesAllowed`: restringe visibilidad por rol
- `iconClass`: clases Tailwind para el ícono
- `meta.align`: alineación CSS
- `visibleWhen(rowData)`: controla visibilidad por fila

---

## 2. Configuración del Módulo (ej. `MoraPresuntaConfig`)

### Campos clave:

```js
{
  createPath, updatePath, deletePath,
  resourcePath, detailPath, filtersPath,
  title, subtitle,
  filters, columnOrder, excludeColumns,
  columnsConfig, monetaryColumns, dateColumns, badgesConfig,
  actionsConfig, modalsConfig
}
```

### Ejemplo de `columnsConfig`

```js
{
  header: "Certificado",
  accessorKey: "certificadoInicial",
  type: "link",
  Icono: RiFilePdf2Line,
  label: "Abrir",
  iconClass: "text-red-500",
  rolesAllowed: ["admin"]
}
```

---

## 3. Props esperadas por `GenericTableWithDetail`

```js
{
  data, total, loading, error,
  pageIndex, setPageIndex,
  excludeColumns,
  handleEdit, handleDelete,
  handleViewDetails, handleBulkDelete,
  monetaryColumns, dateColumns, badgesConfig,
  columnsConfig, sorting, setSorting,
  actionHandlers, role, columnOrder,
  enableColumnVisibility, visibleColumns,
  onVisibleColumnsChange, columnVisibilityKey
}
```

---

## 4. Agregar botón de acción en cada fila

### Paso 1: En `columnsConfig`

```js
{
  header: "Detalle",
  accessorKey: "detalle",
  type: "actions",
  actions: [
    {
      id: "cargarArchivo",
      icon: RiUpload2Line,
      label: "Cargar",
      iconClass: "text-blue-500",
      rolesAllowed: ["admin"],
      visibleWhen: (row) => row.estado === "pendiente"
    }
  ]
}
```

### Paso 2: En `PageContent`

```js
const handleCargarArchivo = useCallback((rowData) => {
  openModal("bulkUpload", {
    gestionId: rowData.id,
    fetchData,
  });
}, [openModal, fetchData]);
```

### Paso 3: En `actionHandlers`

```js
const actionHandlers = {
  cargarArchivo: handleCargarArchivo,
  ...otrasAcciones
};
```

---

## 5. Buenas prácticas

- ❌ **Evita código comentado innecesario**
- 🏦 Centraliza helpers: `utils/generateColumns.js`, `utils/formatters.js`
- 🔹 Nombres consistentes para `modalName`, `id`, `actionType`
- ⚖️ Usa `columnOrder` para garantizar consistencia en la tabla
- 🥜 `modalsConfig` debe mapear exactamente los nombres usados en `openModal(...)`

---

## Extras sugeridos

- `generateActionsColumn()` como helper interno a `generateColumns`
- `modalsConfig` puede validarse con Yup (opcional)
- Si se vuelve muy complejo, considerar `TableBuilderFactory` con props como `withBulk`, `withExport`, `withRowClick`

---

✅ Con esta guía puedes:

- Agregar nuevas columnas con acciones
- Usar `BulkUploadModal`, `ResumenModal`, etc. en filas
- Entender claramente qué hace cada configuración y props

> ⬆️ Recomiendo mantener esta guía junto a los archivos del módulo como referencia.
