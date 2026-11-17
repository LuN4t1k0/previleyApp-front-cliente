# Licencias Médicas dentro del estándar de servicios

## Intención

Reorganizar Licencias Médicas para que el cliente encuentre la misma estructura que en Mora Presunta y Pagos en Exceso, sin perder los indicadores financieros, de ausentismo y de trabajadores propios del servicio.

## Problema actual

Licencias fue construido como un módulo independiente y hoy combina patrones incompatibles:

- usa `Dashboard Global` mientras los demás servicios usan `Dashboard Analítico`;
- su Analítico emplea una jerarquía visual diferente y no muestra la distribución por estado que ya entrega el backend;
- el Operativo selecciona automáticamente la primera empresa y no respeta de forma confiable `?empresa=`;
- el selector de año solo filtra la línea de tiempo, aunque parece afectar todo el dashboard;
- mezcla resumen financiero, operación, movimientos y rankings de trabajadores en una pantalla extensa;
- Gestiones se presenta como una herramienta interna de “Conciliación” y no como bandeja del cliente.

## Objetivos

- Adoptar las secciones `Dashboard Analítico`, `Dashboard Operativo` y `Gestiones`.
- Usar la misma jerarquía visual, ancho, navegación, estados de carga y selector de empresa del estándar común.
- Separar información consolidada, operación por empresa y registros detallados.
- Corregir la selección de empresa y el alcance real de los filtros.
- Mantener `Ficha Trabajador` como acceso complementario.
- Conservar los endpoints y reglas de visibilidad existentes salvo ajustes necesarios para exportación individual segura.

## No objetivos

- No eliminar indicadores propios de Licencias.
- No convertir el portal cliente en una herramienta de administración interna.
- No permitir crear, editar, eliminar, validar o reabrir gestiones al rol cliente.
- No inventar métricas ni aplicar filtros que el backend no pueda sostener.
- No reemplazar la ficha individual del trabajador.

## Enfoques considerados

1. **Ajuste cosmético.** Renombrar y cambiar estilos. Descartado porque no corrige empresa, filtros ni separación de responsabilidades.
2. **Reorganización parcial.** Corregir selección y filtros dentro de los componentes actuales. Reduce cambios, pero conserva una arquitectura y experiencia distintas.
3. **Integración completa al estándar — elegido.** Reutilizar los datos actuales dentro del shell común y dividir claramente Analítico, Operativo y Gestiones. Requiere más trabajo, pero elimina la incoherencia funcional y visual.

## Navegación

```text
Licencias Médicas
├── Dashboard Analítico
├── Dashboard Operativo
├── Gestiones
└── Ficha Trabajador (complementario)
```

Rutas canónicas:

- `/servicios/licencias-medicas/dashboard-analitico`
- `/servicios/licencias-medicas/dashboard-operativo`
- `/servicios/licencias-medicas/gestiones`
- `/servicios/licencias-medicas/ficha-trabajador`

Las rutas actuales bajo `/dashboard/licencia-medica`, `/licencia-medica/*` y `?tab=` se conservarán como wrappers o destinos equivalentes, manteniendo los parámetros de empresa y trabajador.

## Dashboard Analítico

### Alcance

Abre consolidado con todas las empresas autorizadas que tengan información visible. No requiere seleccionar una empresa.

### Encabezado

- Etiqueta: `Dashboard Analítico`.
- Título: `Licencias médicas consolidadas`.
- Alcance visible: empresas asignadas y cantidad de empresas con información.
- Estilo compartido: fondo neutro, paneles blancos, bordes sutiles, ancho máximo común.

### KPI

1. Licencias totales.
2. Licencias vigentes.
3. Trabajadores con licencia.
4. Días totales de ausentismo.

Los montos financieros no se mezclarán en una tarjeta llamada “Saldo financiero”. Se mostrarán en un panel separado con:

- anticipos pagados;
- subsidios recibidos;
- saldo neto `subsidios - anticipos`;
- explicación explícita del signo del saldo.

El saldo bruto anterior es siempre el indicador principal. Si existen acuerdos de pago o un saldo integrado, se muestran en un bloque secundario y con su propia explicación; nunca reemplazan silenciosamente el cálculo bruto.

El backend global deberá exponer los días totales si todavía no están en su contrato.

### Secciones

- Distribución por estado de licencia.
- Ranking de empresas por cantidad de licencias y días acumulados, mostrando nombre y RUT.
- Distribución por entidad.
- Tendencia mensual de licencias y días de ausentismo.
- Acceso al Operativo de una empresa mediante la ruta canónica con `?empresa=<rut>`.

## Dashboard Operativo

### Selección obligatoria

- Con una empresa disponible, se selecciona automáticamente.
- Con varias empresas, no se consulta información hasta una selección explícita.
- Un `?empresa=` válido queda seleccionado al entrar.
- Un RUT inexistente o no autorizado no dispara consultas y muestra el selector obligatorio.
- Cambiar empresa limpia la información anterior e ignora respuestas tardías.

### Filtros

El filtro de año se mantiene solo si todos los KPI, gráficos, movimientos y exportaciones de la vista aceptan el mismo año. De lo contrario se elimina del encabezado y la línea de tiempo utiliza su propio control claramente local.

No se muestra un botón `Actualizar` si el cambio de empresa o filtro ya recarga automáticamente; el reintento queda reservado para errores.

### KPI y secciones

- Licencias registradas.
- Licencias vigentes.
- Trabajadores con licencia.
- Días de ausentismo.
- Distribución por estado.
- Tasa de rechazo y devolución.
- Evolución mensual de licencias y días.
- Comparativo de anticipos y subsidios.
- Trabajadores con mayor cantidad de días, como indicador de atención.
- Cinco expedientes de gestión recientes con empresa, folio, periodo, estado y cantidad de licencias, más enlace `Ver todas` hacia Gestiones conservando la empresa.

El saldo bruto de la empresa se presenta en un panel financiero separado y no domina la lectura operacional. Los acuerdos de pago se presentan como información secundaria cuando existan.

## Gestiones

### Propósito

Reemplazar la presentación interna de “Conciliación” por una bandeja de lectura para clientes.

### Contenido

- Título: `Gestiones de Licencias Médicas`.
- Subtítulo orientado al cliente, sin referencias a analistas o administración.
- Cada fila representa un expediente de gestión, no una licencia individual.
- Las columnas principales son empresa, folio interno, periodo, estado de gestión y cantidad de licencias asociadas.
- Listado completo paginado; no scroll infinito combinado con paginación visible.
- Filtros por empresa, folio interno, periodo y estado de gestión, que son los filtros soportados por el expediente actual.
- Columnas de negocio explícitas, sin exponer campos técnicos o acciones administrativas.
- Acceso de solo lectura al detalle de las licencias, trabajadores, entidades, anticipos y subsidios contenidos en el expediente cuando esté autorizado.
- Descarga individual del Excel completo de cada expediente, validada por empresa, visibilidad de trabajador y auditada.

No se muestran botones Nuevo, Editar, Eliminar, Validar, Reabrir ni Administrar Gestión al rol cliente.

## Ficha Trabajador

Permanece como acceso complementario porque responde a una consulta transversal por persona, no a una de las tres secciones estándar. Su ruta canónica se enlaza desde el hub y desde resultados donde el usuario tenga autorización.

## Contratos de datos

El frontend consumirá contratos diferenciados:

- `analytics`: resumen consolidado, finanzas, estados, empresas, entidades y tendencia;
- `operations`: empresa, KPI, estados, tasas, evolución, finanzas, atención y movimientos recientes;
- `management`: filas, total, filtros, paginación y endpoint de descarga individual.

El backend será la autoridad para alcance de empresa, visibilidad de trabajador y datos sensibles.

## Estados y errores

- Skeleton común durante la carga inicial.
- Selector obligatorio cuando hay varias empresas sin selección.
- Estado vacío que distingue ausencia de registros de un error.
- Error con acción `Reintentar`.
- Ninguna consulta con empresa inválida o no autorizada.
- Ninguna respuesta tardía reemplaza la empresa visible.

## Seguridad

- El frontend solo ofrece empresas autorizadas.
- El backend valida empresa y visibilidad antes de cada lectura o descarga.
- La exportación individual registra usuario, empresa, gestión, archivo y fecha.
- La integración al shell no agrega permisos sobre subservicios `adml` o `rsil`; solo se habilitan capacidades correspondientes a contratos reales.

## Criterios de aceptación

- Licencias muestra las tres etiquetas estándar en el mismo orden que Mora y Pagex.
- El Analítico abre consolidado y usa la jerarquía visual común.
- El Operativo exige empresa cuando existen varias y respeta `?empresa=`.
- Todo filtro visible afecta realmente la totalidad declarada de su vista.
- Gestiones es una bandeja cliente de solo lectura con paginación y Excel individual.
- Ficha Trabajador continúa disponible como acceso complementario.
- Las rutas antiguas relevantes siguen llegando a una vista equivalente.
- Los indicadores financieros se expresan en CLP y el saldo explica su cálculo.
- No se introducen permisos administrativos para clientes.

## Restricciones

- Mantener Next.js 14, React 18, Tremor y Remix Icon.
- No agregar dependencias.
- Reutilizar componentes especializados cuando su contrato sea correcto; no copiar toda la lógica de Mora.
- Aplicar pruebas al registro de rutas, selección obligatoria, query `empresa`, filtros, normalización de datos y autorización de exportaciones.
