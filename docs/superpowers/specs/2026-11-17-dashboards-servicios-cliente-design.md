# Estándar de servicios del portal cliente

## Intención

Dar a todos los servicios contratados una navegación predecible para que el cliente sepa siempre dónde revisar resultados generales, operación por empresa y detalle de gestiones. El patrón de referencia es Mora Presunta y se aplicará a Mora Presunta, Pagos en Exceso, Licencias Médicas, Cargas Familiares, Depósitos Convenidos y Notificaciones Previsionales.

## Objetivos

- Estandarizar las secciones visibles como `Dashboard Analítico`, `Dashboard Operativo` y `Gestiones`.
- Mantener una vista consolidada de todas las empresas autorizadas en el dashboard analítico.
- Exigir o destacar la empresa seleccionada en el dashboard operativo.
- Ofrecer una bandeja de gestiones con búsqueda, filtros y alcance por empresa.
- Reutilizar configuración, navegación, estados de carga, estados vacíos y errores entre servicios.
- Conservar las capacidades específicas de Mora, Pagex y Licencias sin romper sus rutas actuales.

## No objetivos

- No inventar indicadores que el backend no pueda sustentar.
- No igualar artificialmente las reglas de negocio particulares de cada servicio.
- No crear edición, eliminación o carga masiva desde el portal cliente.
- No modificar permisos ni ampliar el acceso a empresas fuera del alcance del usuario.
- No incluir en esta iteración servicios que no estén disponibles para el cliente de referencia, como Zonas Extremas o FUNES.

## Enfoques considerados

1. **Shell y contrato compartidos por servicio — elegido.** Una definición declarativa registra las tres secciones y cada servicio aporta sus consultas, métricas y columnas. Reduce duplicación y hace que los nombres, rutas y estados sean consistentes sin borrar diferencias de negocio.
2. **Mantener módulos independientes con las mismas etiquetas.** Requiere menos refactor inicial, pero perpetúa rutas, selectores y estados distintos, por lo que la experiencia volvería a divergir.
3. **Un solo dashboard con filtro de empresa y tabla inferior.** Es compacto, pero mezcla análisis, seguimiento operativo y detalle; no reproduce el modelo mental ya aprendido en Mora Presunta.

## Modelo de navegación

Cada servicio tendrá una portada o shell común con tres destinos:

```text
Servicio
├── Dashboard Analítico
├── Dashboard Operativo
└── Gestiones
```

Las rutas canónicas serán:

- `/servicios/<servicio>/dashboard-analitico`
- `/servicios/<servicio>/dashboard-operativo`
- `/servicios/<servicio>/gestiones`

La ruta `/servicios/<servicio>` funcionará como portada del servicio. Las rutas y parámetros antiguos de Mora, Pagex y Licencias se conservarán o redirigirán para evitar regresiones.

## Significado de cada sección

### Dashboard Analítico

- Alcance inicial: todas las empresas autorizadas que tengan contratado el servicio.
- Contenido: KPI consolidados, evolución temporal, distribución de estados y comparación entre empresas.
- Puede filtrar una empresa para análisis, pero el estado inicial siempre es consolidado.
- No contiene acciones operativas sobre registros individuales.

### Dashboard Operativo

- Alcance: una empresa seleccionada explícitamente; si solo existe una, queda seleccionada automáticamente.
- Si existen varias empresas y la URL no contiene una empresa válida, se muestra un selector obligatorio y no se consulta el dashboard hasta que el usuario elija.
- Contenido: volumen activo, estados pendientes/cerrados, antigüedad, actividad reciente y otros indicadores accionables disponibles para el servicio.
- El selector de empresa ocupa una posición y terminología comunes en todos los servicios.
- Cambiar de empresa descarta respuestas obsoletas y muestra una transición de carga clara.
- La actividad reciente se limita a cinco gestiones y ofrece `Ver todas` hacia la sección Gestiones; el dashboard no duplica la bandeja completa.

### Gestiones

- Alcance inicial: todas las empresas autorizadas, con filtro de empresa disponible.
- Contenido: tabla paginada de registros, búsqueda, estado, periodo/fecha y campos relevantes del servicio.
- Mantiene los detalles propios de cada dominio mediante columnas configurables.
- Cada fila permite descargar un Excel con el detalle completo de esa gestión; no se limita a exportar el resumen visible.
- La descarga se ofrece de forma consistente para Cargas Familiares, Depósitos Convenidos y Notificaciones Previsionales.
- No se muestran acciones de creación, edición ni eliminación.

## Arquitectura

Una configuración común de servicios declarará:

- clave y alias canónicos;
- título, descripción e iconografía;
- secciones habilitadas y rutas;
- endpoint y normalizadores por sección;
- etiquetas de volumen, estados y columnas de gestiones.

Un `ServiceWorkspace` compartido renderizará portada, navegación y estados comunes. Los contratos de datos serán separados para no confundir niveles:

- `analytics`: resumen global, estados, empresas y serie temporal;
- `operations`: resumen de una empresa, estados, serie temporal y actividad reciente;
- `management`: filas paginadas, total y metadatos de filtros.

Los servicios existentes se adaptarán gradualmente al shell sin reescribir sus dashboards especializados. Cargas Familiares, Depósitos Convenidos y Notificaciones Previsionales reutilizarán los agregadores ya creados, separando su vista consolidada de la vista por empresa y agregando su bandeja de gestiones.

Los subservicios que comparten workspace (`mp-p`/`mp-r` y `adml`/`rsil`) solo aportarán datos y accesos cuando la contratación concreta del usuario los habilite. Compartir presentación no amplía el alcance ni consolida automáticamente contratos distintos.

Para los tres servicios nuevos, Operativo y Gestiones usarán únicamente estados, fechas, volúmenes y campos presentes en sus respuestas actuales. No se inferirán conceptos como activo, cerrado, vencido o antigüedad cuando el contrato del endpoint no los defina.

## Estados y errores

- Carga inicial, cambio de empresa, vacío, error y servicio no configurado tendrán mensajes consistentes.
- Una respuesta tardía de una selección anterior no podrá reemplazar la selección actual.
- Un servicio contratado sin implementación visible mostrará “dashboard no disponible” y nunca una carga infinita.
- Un servicio sin registros distinguirá “sin información” de un error de API.

## Seguridad y alcance

- Las empresas se obtienen del alcance autenticado existente.
- El frontend no enviará ni mostrará empresas fuera de `useEmpresasPermitidas` y `useEmpresasServicios`.
- El backend seguirá siendo la autoridad para validar `empresaRut`.
- La normalización de alias (`cf`, `dc` y claves canónicas) ocurrirá antes de buscar la configuración.
- La descarga individual valida que la gestión pertenezca a una empresa autorizada antes de consultar sus detalles.
- Cada exportación genera un registro de auditoría con usuario, empresa, gestión, servicio y nombre de archivo.
- El rol cliente recibe permiso explícito solo para exportar detalles de sus empresas; no obtiene permisos de edición ni acceso global.

## Verificación y aceptación

- Los seis servicios muestran las mismas tres etiquetas y el mismo orden.
- El analítico abre consolidado; el operativo abre con empresa definida; gestiones permite filtrar por empresa.
- Cargas Familiares, Depósitos Convenidos y Notificaciones Previsionales muestran sus datos reales en las tres secciones.
- Gestiones muestra todas las filas mediante paginación y permite descargar el Excel de detalle de cada una.
- Los dashboards muestran solo cinco gestiones recientes y enlazan a la bandeja completa.
- Mora, Pagex y Licencias conservan sus indicadores y funciones actuales.
- Las rutas antiguas relevantes siguen funcionando.
- Los enlaces actuales por `?tab=`, las rutas históricas bajo `/dashboard`, las páginas de Licencias y los deep links de notificaciones conservarán sus parámetros y llegarán a una vista equivalente, por render directo o redirección interna.
- Pruebas unitarias cubren configuración, alias, alcance y descarte de respuestas obsoletas.
- El build de producción y React Doctor no introducen errores nuevos.

## Restricciones y decisiones

- Se mantienen Next.js 14, React 18, Tremor y Remix Icon; no se agregan dependencias.
- Los endpoints paginados existentes se reutilizan en esta iteración.
- El límite actual de 500 registros es aceptable para los datos de desarrollo, pero los totales derivados deben identificarse como parciales si la API informa más registros; una agregación backend será el paso de escala posterior.
- `Dashboard Global` de Licencias se renombra visualmente a `Dashboard Analítico`.
- Funciones adicionales como priorización de Mora o ficha de trabajador de Licencias permanecen como accesos complementarios, fuera de las tres secciones estándar.

