# Manual de Uso del Portal Cliente

## 1. Objetivo

Este manual explica el uso del frontend cliente de Previley. Su propósito es ayudar a usuarios cliente y cliente administrador a navegar el portal, revisar sus servicios, consultar documentos, generar reportes y administrar accesos internos.

## 2. Acceso al portal

### Inicio de sesión

1. Ingresa a la pantalla de acceso.
2. Escribe tu correo corporativo.
3. Ingresa tu contraseña.
4. Presiona `Ingresar`.

### Consideraciones de seguridad

- Si ingresas credenciales incorrectas repetidamente, la cuenta puede quedar bloqueada temporalmente.
- Si tu cuenta requiere activación inicial, el sistema te redirigirá al flujo de activación.
- El portal valida el estado del bloqueo antes de permitir nuevos intentos.

### Activación de cuenta

Cuando un usuario nuevo es creado por un cliente administrador:

1. Recibe un token de activación.
2. Debe ingresar ese token en la pantalla `Activar Cuenta`.
3. Debe definir una contraseña que cumpla estas reglas:
   - mínimo 8 caracteres
   - al menos 1 letra mayúscula
   - al menos 1 letra minúscula
   - al menos 1 número
4. Luego será redirigido al login.

### Cambio de contraseña

Desde `Perfil`, el usuario puede entrar a `Cambiar contraseña` y actualizar sus credenciales usando un token válido.

## 3. Navegación principal

El menú superior del portal cliente considera las siguientes entradas:

- `Inicio`: resumen general del entorno cliente.
- `Dashboards`: listado de servicios contratados y accesos a cada módulo.
- `Prefacturas`: seguimiento de prefacturas emitidas.
- `Reportes`: generación de reportes dinámicos exportables.
- `Documentos`: consulta y descarga de archivos asociados a la operación.
- `Perfil`: actualización de datos personales.
- `Usuarios`: visible solo para rol `cliente_admin`.

La visibilidad de opciones depende del rol del usuario y de los servicios contratados por sus empresas.

## 4. Inicio y servicios disponibles

La pantalla `Inicio` presenta un panel de acceso a módulos disponibles para el usuario autenticado.

La pantalla `Dashboards` muestra los servicios activos del cliente. Cada tarjeta indica:

- nombre del servicio
- descripción funcional
- cantidad de empresas asociadas
- vistas disponibles, por ejemplo: dashboard global, dashboard operativo, gestiones o ficha trabajador

Al seleccionar `Ir al servicio`, el usuario accede al módulo correspondiente.

## 5. Uso de dashboards por servicio

El portal permite entrar a dashboards según los servicios contratados. Algunos ejemplos:

- `Mora Presunta`
- `Pagos en Exceso`
- `Licencias Médicas`
- `Pagos Previsionales`
- `Cargas Familiares`
- `Depósitos Convenidos`
- `Notificaciones Previsionales`

### Comportamiento general

En la mayoría de los servicios el usuario puede:

- seleccionar la empresa a consultar
- aplicar un rango de fechas opcional
- revisar indicadores y métricas del servicio
- consultar información complementaria de empresa
- descargar documentos asociados cuando el módulo lo permita

### Servicios con navegación interna

Algunos módulos incluyen pestañas o vistas internas:

- `Mora Presunta`: dashboard global, dashboard operativo y gestiones
- `Licencias Médicas`: dashboard global, dashboard operativo, gestiones y ficha trabajador
- `Pagos en Exceso`: dashboard global y dashboard operativo

## 6. Módulo de prefacturas

La sección `Prefacturas` permite revisar la facturación preliminar asociada a las empresas del cliente.

### Funcionalidades principales

- filtrar por estado
- buscar por folio
- filtrar por empresa
- paginar resultados
- refrescar la consulta
- entrar al detalle de cada prefactura
- descargar documentos asociados

### Recomendación de uso

Usa primero el filtro por empresa y luego el filtro por estado para reducir el volumen de resultados. Si conoces el folio, utiliza la búsqueda directa.

## 7. Centro de documentos

La sección `Documentos` consolida archivos operativos y tributarios relacionados con prefacturas y producciones.

### Tipos de documentos disponibles

- prefactura
- factura
- certificado inicial
- certificado final
- detalle
- comprobante de pago

### Funcionalidades principales

- filtrar por estado
- filtrar por empresa
- buscar por folio
- filtrar por tipo de documento
- expandir registros para ver adjuntos
- descargar archivos firmados o resueltos desde almacenamiento

## 8. Reportes dinámicos

La sección `Reportes` permite construir reportes configurables y exportarlos.

### Flujo de trabajo

1. Seleccionar dataset.
2. Elegir columnas.
3. Definir filtros.
4. Definir orden.
5. Ejecutar vista previa.
6. Exportar.

### Funcionalidades disponibles

- vista previa paginada
- exportación en `CSV`
- exportación en `XLSX`
- historial de exportaciones recientes
- descarga del archivo generado
- eliminación individual o masiva del historial

### Estados de exportación

- `En cola`
- `Procesando`
- `Listo`
- `Falló`

## 9. Perfil de usuario

En `Perfil` cada usuario puede actualizar:

- nombre
- apellido
- teléfono
- correo electrónico

Los cambios actualizan también la sesión activa para reflejar el nuevo nombre o correo en el portal.

Si el usuario tiene rol `cliente_admin`, desde esta vista también puede acceder a opciones internas adicionales, como contratos.

## 10. Administración de usuarios

La sección `Usuarios` está disponible solo para `cliente_admin`.

Incluye dos módulos:

- `Subusuarios`
- `Trabajadores protegidos`

### 10.1 Subusuarios

Permite:

- crear subusuarios
- editar sus datos
- asignar empresas
- definir rol `cliente` o `cliente_admin`
- habilitar visibilidad sobre trabajadores protegidos
- cerrar sesiones activas
- suspender usuarios
- eliminar usuarios definitivamente

### Reglas relevantes

- Para crear un subusuario se debe asignar al menos una empresa.
- Al crear un subusuario, el sistema informa que se enviará un correo para crear contraseña.
- Algunos cambios requieren que el usuario vuelva a iniciar sesión para aplicarse.

### 10.2 Trabajadores protegidos

Permite administrar nóminas de RUT protegidos por empresa.

Funciones:

- seleccionar empresa
- agregar un RUT manualmente
- registrar motivo opcional
- eliminar registros
- realizar carga masiva por archivo `CSV`, `XLS` o `XLSX`

### Modos de carga masiva

- `Append`: agrega o actualiza registros existentes
- `Replace`: reemplaza la lista actual por la nueva carga

Después de una carga masiva, los cambios aplican a usuarios cliente en su próxima sesión.

## 11. Buenas prácticas de uso

- Mantén actualizado tu perfil de contacto.
- Filtra por empresa antes de exportar reportes amplios.
- Usa el historial de exportaciones para evitar generar el mismo archivo varias veces.
- Revisa periódicamente `Prefacturas` y `Documentos` para descargar respaldos.
- Si administras subusuarios, confirma sus empresas asignadas antes de guardar.
- Cuando cambies permisos o empresas de un subusuario, indícale que cierre sesión y vuelva a ingresar.

## 12. Limitaciones y visibilidad

- No todos los usuarios ven los mismos módulos.
- No todos los clientes tienen habilitados todos los servicios.
- Algunas opciones dependen del rol y otras del contrato activo por empresa.
- La sección `Documentación` dentro del portal puede mostrar solo material resumido; este archivo funciona como manual extendido.

## 13. Soporte

Si un usuario no puede acceder, no visualiza un servicio esperado o detecta información inconsistente:

1. Verifica primero el rol del usuario.
2. Revisa las empresas asignadas.
3. Confirma si el servicio está contratado.
4. Si el problema persiste, escálalo al equipo de soporte o al ejecutivo Previley.
