# Dashboards de servicios del portal cliente

## Intención

Completar el portal cliente antes de la reunión del 18 de noviembre de 2026 para que Cargas Familiares, Depósitos Convenidos y Notificaciones Previsionales muestren información real, siguiendo la experiencia analítica multiempresa de Mora Presunta.

## Objetivos

- Mostrar un dashboard analítico para cada uno de los tres servicios contratados.
- Respetar automáticamente las empresas autorizadas del usuario autenticado.
- Exponer KPI, distribución por estado, ranking por empresa, evolución mensual y gestiones recientes.
- Permitir filtrar por empresa sin perder la vista consolidada.
- Evitar estados de carga infinitos cuando un servicio no tenga un cargador válido.

## No objetivos

- No crear flujos de edición, carga masiva o eliminación desde el portal cliente.
- No modificar los datos ni la lógica de negocio del backend.
- No replicar toda la complejidad judicial/financiera propia de Mora Presunta en servicios que no tienen esas dimensiones.

## Enfoques considerados

1. Crear tres servicios y tres dashboards totalmente independientes. Es directo, pero duplica normalización, estados y presentación.
2. Crear endpoints analíticos nuevos en el backend. Es la solución ideal a gran escala, pero introduce más superficie y riesgo antes de la reunión cuando los volúmenes actuales son pequeños.
3. Reutilizar los endpoints paginados existentes y construir una capa analítica compartida en el cliente. Elegido porque los endpoints ya aplican alcance por empresa, los volúmenes actuales son acotados y permite una entrega consistente con menor riesgo.

## Diseño

`serviceDashboardDefinitions` describe por servicio el endpoint, el campo de volumen y la terminología visible. Un agregador puro convierte las gestiones en un contrato común:

- `summary`: gestiones, registros/casos/cargas, empresas y porcentaje cerrado.
- `states`: cantidad de gestiones por estado.
- `companies`: volumen y gestiones por empresa.
- `timeline`: volumen y gestiones por mes.
- `latest`: últimas gestiones normalizadas.

Un componente `OperationalServiceDashboard` consume ese contrato y renderiza la misma jerarquía visual del dashboard analítico de Mora: encabezado, alcance, KPI, comparaciones y actividad reciente. Las tres rutas genéricas seleccionan la definición correcta por clave canónica.

## Restricciones y decisiones

- Se mantienen Next.js 14, React 18, Tremor y Remix Icon; no se agregan dependencias.
- La consulta solicita hasta 500 gestiones, suficiente para los datos actuales, y conserva el total reportado por la API.
- La opción “Todas las empresas” es la vista inicial.
- Estados desconocidos se muestran con etiqueta humanizada y tono neutro.
- Un servicio reconocido sin cargador deja de cargar y muestra un error explícito.

