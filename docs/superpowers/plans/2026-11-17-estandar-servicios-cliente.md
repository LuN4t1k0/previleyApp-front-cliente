# Estándar de servicios del portal cliente Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Estandarizar seis servicios del portal cliente con las secciones Dashboard Analítico, Dashboard Operativo y Gestiones, manteniendo datos y enlaces existentes.

**Architecture:** Un registro puro describe slugs, alias, rutas y capacidades; un workspace compartido resuelve la portada y las secciones. Mora, Pagex y Licencias conservan sus componentes especializados, mientras Cargas Familiares, Depósitos Convenidos y Notificaciones Previsionales comparten contratos de analítica, operación por empresa y gestiones paginadas.

**Tech Stack:** Next.js 14 App Router, React 18, Tremor, Remix Icon, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-17-dashboards-servicios-cliente-design.md`

## Global Constraints

- Mantener Next.js 14, React 18, Tremor y Remix Icon; no agregar dependencias.
- Usar únicamente las empresas autorizadas por `useEmpresasPermitidas` y `useEmpresasServicios`; el backend conserva la validación final de `empresaRut`.
- Usar exactamente y en este orden: `Dashboard Analítico`, `Dashboard Operativo`, `Gestiones`.
- No inventar estados ni indicadores no presentes en la API.
- Preservar deep links, parámetros y funciones complementarias existentes.
- Con varias empresas, el Operativo no consulta datos hasta una selección explícita válida.

## Review Focus

- Alias de subservicio contratado (`mp-p`, `mp-r`, `adml`, `rsil`, `cf`, `dc`) debe resolver al workspace correcto sin ampliar los contratos visibles; se prueba en Task 1.
- Una sección o slug desconocido debe producir un estado no configurado, nunca carga infinita; se prueba en Task 1 y Task 2.
- Con varias empresas y sin `empresa`, el Operativo no debe llamar al fetcher; se prueba en Task 3.
- Una respuesta tardía de la empresa anterior no debe reemplazar la selección actual; se prueba en Task 3.
- Si `total > data.length`, las métricas derivadas deben marcarse como parciales y Gestiones debe conservar el total de la API; se prueba en Task 3 y Task 4.

---

### Task 1: Registro canónico de workspaces y rutas

**Files:**
- Create: `src/config/clientServiceWorkspace.mjs`
- Modify: `src/config/operationalServiceDashboards.mjs`
- Test: `tests/clientServiceWorkspace.test.mjs`

**Interfaces:**
- Consumes: `CLIENT_SERVICE_DEFINITIONS` solo como referencia de nombres; el módulo `.mjs` permanece puro para pruebas Node.
- Produces: `SERVICE_SECTIONS`, `getServiceWorkspace(value)`, `getCanonicalServiceSection(value)`, `getServiceSectionHref(value, section)`, `getWorkspaceForContractedKeys(keys)`.

- [ ] **Step 1: Write the failing tests**

Crear casos que afirmen: seis slugs canónicos; tres secciones en orden; `cf`/`dc`, `mp-p`/`mp-r` y `adml`/`rsil` resuelven al padre correcto; los contratos devueltos conservan solo las claves entregadas; slug/sección desconocidos retornan `null`; las rutas siguen `/servicios/<slug>/<section>`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/clientServiceWorkspace.test.mjs`
Expected: FAIL porque `clientServiceWorkspace.mjs` no existe.

- [ ] **Step 3: Implement the pure registry**

Definir workspaces `mora-presunta`, `pagos-en-exceso`, `licencias-medicas`, `cargas-familiares`, `depositos-convenidos` y `notificaciones-previsionales`. Cada entrada declara `key`, `slug`, `title`, `contractKeys`, `sections`; la resolución de contratos devuelve `{ workspace, enabledContractKeys }` sin agregar claves no recibidas.

- [ ] **Step 4: Run the focused and full pure suites**

Run: `node --test tests/clientServiceWorkspace.test.mjs tests/operationalServiceDefinitions.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/config/clientServiceWorkspace.mjs src/config/operationalServiceDashboards.mjs tests/clientServiceWorkspace.test.mjs
git commit -m "feat: define standard client service workspaces"
```

### Task 2: Portada y navegación compartida

**Files:**
- Create: `src/modules/service-workspace/ServiceWorkspaceHub.jsx`
- Create: `src/modules/service-workspace/ServiceSectionNav.jsx`
- Create: `src/modules/service-workspace/ServiceSectionRouter.jsx`
- Create: `src/app/(authenticated)/servicios/[service]/[section]/page.jsx`
- Modify: `src/app/(authenticated)/servicios/[service]/page.jsx`
- Test: `tests/clientServiceWorkspace.test.mjs`

**Interfaces:**
- Consumes: Task 1 `getServiceWorkspace`, `getCanonicalServiceSection`, `getServiceSectionHref`.
- Produces: `ServiceWorkspaceHub({ serviceKey, enabledContractKeys })`, `ServiceSectionNav({ workspace, activeSection })`, `ServiceSectionRouter({ serviceKey, section })`.

- [ ] **Step 1: Extend the failing route tests**

Agregar aserciones para que la portada tenga exactamente tres destinos en orden y para que `dashboard-global` se normalice a `dashboard-analitico`, mientras una sección desconocida retorna `null`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/clientServiceWorkspace.test.mjs`
Expected: FAIL en la normalización legacy aún no implementada.

- [ ] **Step 3: Implement the shared hub and navigation**

La portada usa tres tarjetas comunes. `ServiceSectionRouter` resuelve la sección y delega a vistas especializadas o operacionales; una configuración inexistente muestra el mensaje explícito existente. Mantener `priorizacion` de Mora y `ficha-trabajador` de Licencias como accesos complementarios, fuera del arreglo estándar.

- [ ] **Step 4: Preserve root-route compatibility**

En `[service]/page.jsx`, renderizar el hub cuando no existe `tab`; cuando existe `tab`, normalizarlo y renderizar la sección equivalente sin eliminar parámetros. No cambiar enlaces ajenos al workspace en esta tarea.

- [ ] **Step 5: Verify tests and production compilation**

Run: `node --test tests/clientServiceWorkspace.test.mjs && npm run build`
Expected: tests PASS; build `Compiled successfully`.

- [ ] **Step 6: Commit**

```bash
git add src/modules/service-workspace src/app/'(authenticated)'/servicios/'[service]' src/config/clientServiceWorkspace.mjs tests/clientServiceWorkspace.test.mjs
git commit -m "feat: add shared client service navigation"
```

### Task 3: Separar analítica consolidada y operación por empresa

**Files:**
- Modify: `src/modules/operational-services/OperationalServiceDashboard.jsx`
- Create: `src/modules/operational-services/OperationalAnalyticsDashboard.jsx`
- Create: `src/modules/operational-services/OperationalCompanyDashboard.jsx`
- Modify: `src/hooks/useServiceDashboard.js`
- Modify: `src/services/clientServiceApi.js`
- Modify: `src/services/operationalServiceDashboard.mjs`
- Modify: `src/services/dashboardRequestState.mjs`
- Test: `tests/operationalServiceDashboard.test.mjs`
- Test: `tests/dashboardRequestState.test.mjs`

**Interfaces:**
- Consumes: definición devuelta por `getOperationalDashboardDefinition(serviceKey)`.
- Produces: `OperationalAnalyticsDashboard({ serviceKey })`, `OperationalCompanyDashboard({ serviceKey })`, `resolveRequiredEmpresa(empresas, requestedRut)` y datos con `isPartial`.

- [ ] **Step 1: Write failing selection and partial-data tests**

Probar que `resolveRequiredEmpresa`: retorna la única empresa automáticamente; retorna una empresa válida solicitada; retorna `null` con varias empresas sin selección o RUT inválido. Probar que el agregador retorna `isPartial: true` cuando `apiTotal > rows.length`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/operationalServiceDashboard.test.mjs tests/dashboardRequestState.test.mjs`
Expected: FAIL por exports/propiedades ausentes.

- [ ] **Step 3: Implement selection and data contracts**

El analítico consulta sin `empresaRut` y abre consolidado. El operativo consulta solo después de `resolveRequiredEmpresa`; al cambiar empresa limpia datos visibles y usa `createLatestRequestTracker` para ignorar respuestas anteriores. El agregador conserva `apiTotal`, `loadedRows` e `isPartial`.

- [ ] **Step 4: Split the shared presentation**

Extraer la presentación común actual a componentes enfocados. Analítico muestra empresas y evolución; Operativo omite ranking multiempresa, muestra empresa seleccionada, estados y actividad reciente. Si `isPartial`, ambos muestran una advertencia junto a las métricas derivadas.

- [ ] **Step 5: Run focused and regression tests**

Run: `node --test tests/operationalServiceDashboard.test.mjs tests/dashboardRequestState.test.mjs`
Expected: PASS, incluida la carrera de respuestas.

- [ ] **Step 6: Commit**

```bash
git add src/modules/operational-services src/hooks/useServiceDashboard.js src/services/clientServiceApi.js src/services/operationalServiceDashboard.mjs src/services/dashboardRequestState.mjs tests/operationalServiceDashboard.test.mjs tests/dashboardRequestState.test.mjs
git commit -m "feat: separate analytic and operational dashboards"
```

### Task 4: Bandeja de gestiones para los tres servicios nuevos

**Files:**
- Create: `src/services/operationalServiceManagement.mjs`
- Create: `src/modules/operational-services/OperationalServiceManagement.jsx`
- Modify: `src/services/clientServiceApi.js`
- Modify: `src/config/operationalServiceDashboards.mjs`
- Test: `tests/operationalServiceManagement.test.mjs`

**Interfaces:**
- Consumes: endpoint, `volumeField`, `volumeLabel` y columnas de `getOperationalDashboardDefinition`.
- Produces: `buildManagementQuery({ page, pageSize, empresaRut, folio, estado })`, `normalizeManagementResponse(payload, definition)`, `OperationalServiceManagement({ serviceKey })`.

- [ ] **Step 1: Write failing query and normalization tests**

Probar `offset=(page-1)*pageSize`; omisión de filtros vacíos; preservación de `total`; normalización de columnas comunes `folio`, `empresaNombre`, `empresaRut`, `fechaGestion`, `estado`, volumen y comentario/observaciones; valores faltantes como `—`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/operationalServiceManagement.test.mjs`
Expected: FAIL porque el módulo no existe.

- [ ] **Step 3: Implement the API adapter and service definitions**

Usar únicamente los filtros uniformemente soportados por los endpoints actuales: `limit`, `offset`, `empresaRut`, `folio` y `estado`. Definir columnas por servicio: `totalCargas` + `comentario`; `totalRegistros` + `observaciones`; `totalCasos` + `observaciones`.

- [ ] **Step 4: Implement the read-only management table**

Mostrar filtros por empresa, folio y estado, tabla paginada y estados carga/vacío/error. El alcance inicial es todas las empresas. No mostrar crear, editar, eliminar ni exportar, porque el rol cliente no tiene esas autorizaciones uniformemente.

- [ ] **Step 5: Run focused tests and build**

Run: `node --test tests/operationalServiceManagement.test.mjs && npm run build`
Expected: test PASS; build `Compiled successfully`.

- [ ] **Step 6: Commit**

```bash
git add src/services/operationalServiceManagement.mjs src/modules/operational-services/OperationalServiceManagement.jsx src/services/clientServiceApi.js src/config/operationalServiceDashboards.mjs tests/operationalServiceManagement.test.mjs
git commit -m "feat: add client operational management tables"
```

### Task 5: Adaptar Mora, Pagex y Licencias al estándar sin regresiones

**Files:**
- Modify: `src/modules/service-workspace/ServiceSectionRouter.jsx`
- Modify: `src/config/module/mora/moraTabs.config.js`
- Modify: `src/config/module/pagex/pagexTabs.js`
- Modify: `src/config/module/licencias/licenciasClientTabs.config.js`
- Modify: `src/app/(authenticated)/servicios/mora-presunta/dashboard-analitico/page.jsx`
- Modify: `src/app/(authenticated)/servicios/mora-presunta/dashboard-operativo/page.jsx`
- Modify: `src/app/(authenticated)/servicios/mora-presunta/gestiones/page.jsx`
- Modify: existing legacy route wrappers only where a compatibility redirect is required.
- Test: `tests/clientServiceWorkspace.test.mjs`

**Interfaces:**
- Consumes: Task 1 routing metadata and Task 2 `ServiceSectionRouter`.
- Produces: one standard entry path per section while retaining specialized dashboards and existing complementary pages.

- [ ] **Step 1: Add failing compatibility-matrix tests**

Crear una table-driven matrix for Mora, Pagex and Licencias covering canonical paths, legacy tab keys, `/dashboard/...` destinations and parameter preservation. Assert that Licencias displays `Dashboard Analítico`, not `Dashboard Global`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/clientServiceWorkspace.test.mjs`
Expected: FAIL for legacy destinations and Licencias label.

- [ ] **Step 3: Wire specialized components to the standard sections**

Mapear Mora a `MoraGlobalDashboard`, `MoraOperativaDashboard`, `MoraGestionesDashboard`; Pagex a `PagexAnaliticoDashboard`, `PagexOperativaDashboard`, `PagexGestionesDashboard`; Licencias a `LicenciasGlobalDashboard`, `EmpresaLicenciasDashboard`, `ConcliliacionGestion`. Mantener priorización y ficha de trabajador como accesos complementarios.

- [ ] **Step 4: Preserve legacy navigation**

Actualizar wrappers/enlaces para llegar a rutas canónicas conservando `empresa` y demás query params. No eliminar rutas existentes; preferir render equivalente cuando un redirect pueda perder estado.

- [ ] **Step 5: Run all tests and production checks**

Run: `node --test tests/*.test.mjs`
Expected: all PASS.

Run: `npm run build`
Expected: `Compiled successfully` with no new error.

Run: `npx -y react-doctor@latest . --verbose`
Expected: no new actionable finding in changed files.

- [ ] **Step 6: Manually verify the six-service matrix**

En la rama local, autenticar como cliente de desarrollo y comprobar las tres secciones de los seis servicios. Para Operativo con varias empresas, verificar selector obligatorio, cambio de empresa y ausencia de datos obsoletos. Confirmar que los enlaces legacy relevantes llegan a una vista equivalente.

- [ ] **Step 7: Commit**

```bash
git add src/modules/service-workspace src/config/module src/app/'(authenticated)' tests/clientServiceWorkspace.test.mjs
git commit -m "feat: standardize existing client service sections"
```
