# Licencias Médicas dentro del estándar de servicios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar Licencias Médicas al estándar Analítico, Operativo y Gestiones, conservando sus métricas propias, rutas históricas y seguridad por empresa/trabajador.

**Architecture:** Un registro de workspace y adaptadores puros separan navegación y contratos de datos de la presentación. Analítico compone el contrato global extendido; Operativo compone endpoints por empresa y exige selección explícita; Gestiones presenta expedientes paginados de solo lectura y usa una exportación backend autorizada, filtrada y auditada.

**Tech Stack:** Next.js 14, React 18, Tremor, Remix Icon, Express, Sequelize, Jest, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-17-licencias-medicas-estandar-design.md`

## Global Constraints

- No agregar dependencias.
- Usar exactamente `Dashboard Analítico`, `Dashboard Operativo`, `Gestiones`; `Ficha Trabajador` es complementaria.
- Con varias empresas, Operativo no consulta hasta una selección explícita válida; con una, autoselecciona.
- El saldo principal es `subsidios - anticipos`; acuerdos de pago son secundarios.
- Gestiones lista expedientes, no licencias individuales.
- El cliente nunca recibe acciones administrativas.
- Toda exportación valida empresa y visibilidad de trabajador, usa acción `EXPORT` y genera auditoría.
- Preservar `?empresa=`, `?tab=`, rutas `/dashboard/licencia-medica/*` y `/licencia-medica/*`.
- El backend es otro repositorio: crear allí `feature/dashboards-servicios-cliente` desde el HEAD actual `9d71613b` de `feature/dashboard-mora-historia-ejecutiva`, sin worktree y sin tocar el `.claude/` no rastreado del usuario. Esto conserva los tres commits de dashboard que la infraestructura local ya utiliza.

## Review Focus

- `?empresa=` inválido o ajeno no debe consultar ni seleccionar otra empresa silenciosamente; Task 2.
- Una respuesta anterior no debe reemplazar el Operativo de la empresa actual; Task 4.
- Saldo bruto, saldo integrado y acuerdos no deben confundirse ni sobrescribirse; Task 3 y Task 4.
- El Excel no debe incluir trabajadores ocultos ni gestiones de otra empresa; Task 5.
- Las rutas legacy deben conservar empresa, trabajador y sección sin bucles de redirección; Task 6.

---

### Task 1: Contratos puros de Licencias y navegación estándar

**Files:**
- Create: `src/services/licenciasWorkspace.mjs`
- Create: `src/config/clientServiceWorkspace.mjs` (si el plan general ya lo creó, extenderlo sin reemplazar los demás workspaces).
- Test: `tests/licenciasWorkspace.test.mjs`

**Interfaces:**
- Produces: `LICENCIAS_SECTIONS`, `resolveLicenciasSection(value)`, `buildLicenciasSectionHref(section, params)`, `normalizeLicenciasAnalytics(payload)`, `normalizeLicenciasOperations(payload)`, `resolveRequiredEmpresa(empresas, requestedRut)`.
- Consumes: objetos JSON de los endpoints de Licencias y arrays `{ empresaRut, nombre }`.

- [ ] **Step 1: Write failing contract tests**

Probar orden y etiquetas de tres secciones; `dashboard-global` → `dashboard-analitico`; query `empresa` preservada; empresa única autoseleccionada; múltiples sin query retornan `null`; RUT válido se respeta; RUT inválido retorna `null`; saldo bruto es subsidios menos anticipos; acuerdos permanecen en campo secundario.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/licenciasWorkspace.test.mjs`
Expected: FAIL porque el módulo no existe.

- [ ] **Step 3: Implement the pure contracts**

Los normalizadores devuelven números finitos y arreglos estables. `buildLicenciasSectionHref` genera `/servicios/licencias-medicas/<section>` y serializa solo parámetros no vacíos. Ningún helper consulta red ni depende de React.

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/licenciasWorkspace.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/licenciasWorkspace.mjs src/config/clientServiceWorkspace.mjs tests/licenciasWorkspace.test.mjs
git commit -m "feat: define medical leave workspace contracts"
```

### Task 2: Shell, rutas y selector obligatorio

**Files:**
- Create: `src/modules/licencias/LicenciasWorkspaceHub.jsx`
- Create: `src/modules/licencias/LicenciasSectionNav.jsx`
- Create: `src/app/(authenticated)/servicios/licencias-medicas/dashboard-analitico/page.jsx`
- Create: `src/app/(authenticated)/servicios/licencias-medicas/dashboard-operativo/page.jsx`
- Create: `src/app/(authenticated)/servicios/licencias-medicas/gestiones/page.jsx`
- Create: `src/app/(authenticated)/servicios/licencias-medicas/ficha-trabajador/page.jsx`
- Modify: `src/app/(authenticated)/servicios/[service]/page.jsx`
- Modify: `src/config/module/licencias/licenciasClientTabs.config.js`
- Test: `tests/licenciasWorkspace.test.mjs`

**Interfaces:**
- Consumes: Task 1 section resolver and href builder.
- Produces: canonical server route wrappers plus `LicenciasSectionNav({ activeSection })` and `LicenciasWorkspaceHub()`.

- [ ] **Step 1: Extend failing route tests**

Agregar matriz de rutas canónicas y legacy; afirmar que la portada contiene exactamente las tres secciones estándar más Ficha Trabajador complementaria; afirmar que `empresa` y `trabajador` sobreviven al destino.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/licenciasWorkspace.test.mjs`
Expected: FAIL en la matriz nueva.

- [ ] **Step 3: Implement canonical wrappers and shared navigation**

Cada página canónica delega al componente de sección y muestra la misma navegación. Cambiar la etiqueta visual `Dashboard Global` por `Dashboard Analítico`. La portada no carga datos analíticos.

- [ ] **Step 4: Implement mandatory-company entry behavior**

El wrapper Operativo lee `empresa`; pasa solo un RUT autorizado a la vista. Con múltiples empresas sin RUT muestra selector; con una usa esa empresa. No elegir la primera cuando hay varias.

- [ ] **Step 5: Run tests and compile**

Run: `node --test tests/licenciasWorkspace.test.mjs && npm run build`
Expected: tests PASS; build `Compiled successfully`.

- [ ] **Step 6: Commit**

```bash
git add src/modules/licencias/LicenciasWorkspaceHub.jsx src/modules/licencias/LicenciasSectionNav.jsx src/app/'(authenticated)'/servicios/licencias-medicas src/app/'(authenticated)'/servicios/'[service]'/page.jsx src/config/module/licencias/licenciasClientTabs.config.js tests/licenciasWorkspace.test.mjs
git commit -m "feat: add standard medical leave navigation"
```

### Task 3: Extender el contrato analítico global en backend

**Files:**
- Modify: `../backend/src/services/licenciaDashboard.service.js`
- Test: `../backend/tests/licenciaDashboard.globalContract.test.js`

**Interfaces:**
- Produces from `getGlobalDashboard`: `resumen.totalDias`, `resumen.totalAnticipos`, `resumen.totalSubsidios`, `resumen.saldoBruto`; ranking rows with `empresaRut`, `empresaNombre`, `totalLicencias`, `totalDias`; trend rows with `periodo`, `cantidad`, `totalDias`; `totalEmpresasConInformacion`.
- Preserves: existing `resumen`, `rankingEmpresas`, `distribucionEntidad`, `distribucionEstado`, `tendencia` keys.

- [ ] **Step 1: Write failing service contract tests**

Mockear Sequelize/models y afirmar: días totales agregados; saldo bruto calculado; ranking incluye nombre sin ampliar scope; tendencia incluye días; empresas se cuentan desde el resultado scoped; arreglos vacíos producen ceros.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ../backend && npm test -- tests/licenciaDashboard.globalContract.test.js --runInBand`
Expected: FAIL por campos ausentes.

- [ ] **Step 3: Implement scoped aggregates**

Extender las consultas existentes con `SUM(numero_dias)` y join/lookup de nombre de empresa dentro del mismo scope. Calcular `saldoBruto = totalSubsidios - totalAnticipos`; no incluir saldo integrado en el global.

- [ ] **Step 4: Run focused test**

Run: `cd ../backend && npm test -- tests/licenciaDashboard.globalContract.test.js --runInBand`
Expected: PASS.

- [ ] **Step 5: Commit in backend**

```bash
cd ../backend
git add src/services/licenciaDashboard.service.js tests/licenciaDashboard.globalContract.test.js
git commit -m "feat: extend medical leave analytics contract"
```

### Task 4: Reconstruir Analítico y Operativo

**Files:**
- Modify: `src/modules/licencias/LicenciasGlobalDashboard.jsx`
- Modify: `src/modules/licencias/EmpresaLicenciasDashboard.jsx`
- Create: `src/modules/licencias/LicenciasFinancialPanel.jsx`
- Create: `src/hooks/useLicenciasCompanyDashboard.js`
- Modify: `src/services/clientServiceApi.js`
- Modify: `src/services/dashboardRequestState.mjs`
- Test: `tests/licenciasWorkspace.test.mjs`
- Test: `tests/dashboardRequestState.test.mjs`

**Interfaces:**
- Consumes: Task 1 normalizers and Task 3 global contract.
- Produces: Analítico consolidado; Operativo por empresa; hook `{ data, loading, error, retry }` that ignores stale responses.

- [ ] **Step 1: Add failing normalization and stale-request tests**

Probar estados vacíos; ranking con nombre+RUT; tendencia con licencias+días; saldo bruto principal y acuerdo secundario; cinco expedientes recientes ordenados; cambio A→B permite actualizar solo a B.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/licenciasWorkspace.test.mjs tests/dashboardRequestState.test.mjs`
Expected: FAIL en los casos nuevos.

- [ ] **Step 3: Implement Analítico using the common hierarchy**

Encabezado neutro, cuatro KPI, panel financiero, estados, ranking, entidades y tendencia. Los botones de ranking usan ruta canónica con `empresa`. No usar glass panels, gradiente ni `Dashboard global`.

- [ ] **Step 4: Implement Operativo using mandatory selection**

Componer endpoints existentes para resumen, estados, tasas, evolución, anticipos/subsidios y top por días. Consultar `/gestion-licencia?empresaRut=<rut>&limit=5&offset=0` para expedientes recientes. Eliminar año global y botón Actualizar; mantener reintento solo en error.

- [ ] **Step 5: Separate financial semantics**

`LicenciasFinancialPanel` presenta anticipos, subsidios y saldo bruto en CLP. Acuerdos/saldo integrado aparecen en bloque secundario con etiqueta explícita.

- [ ] **Step 6: Run tests and build**

Run: `node --test tests/licenciasWorkspace.test.mjs tests/dashboardRequestState.test.mjs && npm run build`
Expected: tests PASS; build successful.

- [ ] **Step 7: Commit**

```bash
git add src/modules/licencias src/hooks/useLicenciasCompanyDashboard.js src/services/clientServiceApi.js src/services/dashboardRequestState.mjs tests/licenciasWorkspace.test.mjs tests/dashboardRequestState.test.mjs
git commit -m "feat: standardize medical leave dashboards"
```

### Task 5: Bandeja cliente y exportación segura de expedientes

**Files:**
- Create: `src/modules/licencias/LicenciasManagement.jsx`
- Create: `src/services/licenciasManagement.mjs`
- Modify: `src/services/clientServiceApi.js`
- Modify: `../backend/src/routes/gestionLicencia.router.js`
- Modify: `../backend/src/controller/gestionLicencia.controller.js`
- Modify: `../backend/src/services/gestionLicencia.service.js`
- Modify: `../backend/src/security/access/resources.js`
- Test: `tests/licenciasManagement.test.mjs`
- Test: `../backend/tests/gestionLicencia.clientExport.test.js`

**Interfaces:**
- Produces frontend: `buildLicenciasManagementQuery({ page, pageSize, empresaRut, folioInterno, periodo, estado })`, `normalizeGestionLicenciaPage(payload)`, `downloadGestionLicenciaExcel(id)`.
- Produces backend: `GET /gestion-licencia/:id/excel-detalle` authorized with `EXPORT`, scoped by parent `empresaRut`, visibility-filtered, audited.

- [ ] **Step 1: Write failing frontend management tests**

Probar offset, filtros vacíos, total/páginas, expediente con empresa/folio/periodo/estado/cantidad licencias y endpoint de descarga.

- [ ] **Step 2: Write failing backend security tests**

Probar cliente/cliente_admin dentro de scope; rechazo fuera de scope antes de generar Excel; trabajador/admin conservan acceso; filas ocultas por visibilidad no llegan al workbook; éxito registra usuario, empresa, gestión, filename y scope de auditoría.

- [ ] **Step 3: Run tests to verify they fail**

Run: `node --test tests/licenciasManagement.test.mjs`
Expected: FAIL porque el módulo no existe.

Run: `cd ../backend && npm test -- tests/gestionLicencia.clientExport.test.js --runInBand`
Expected: FAIL porque la ruta usa `READ` y no audita exportación.

- [ ] **Step 4: Implement least-privilege backend export**

Cambiar ruta a `EXPORT` con `audit: true` y sujeto padre. Pasar actor/access context al servicio; aplicar visibilidad de trabajador al dataset antes de crear XLSX. Registrar auditoría de exportación. No conceder CREATE, UPDATE, DELETE ni ANNUL.

- [ ] **Step 5: Implement read-only client management table**

Paginación real de 20 filas, filtros de expediente soportados, columnas explícitas, `Ver detalle` en modo lectura y `Descargar Excel` por fila. No reutilizar ActionButtons administrativos ni scroll infinito.

- [ ] **Step 6: Run focused tests and builds**

Run: `node --test tests/licenciasManagement.test.mjs`
Expected: PASS.

Run: `cd ../backend && npm test -- tests/gestionLicencia.clientExport.test.js --runInBand`
Expected: PASS.

Run: `npm run build`
Expected: frontend build successful.

- [ ] **Step 7: Commit each repository**

```bash
cd ../backend
git add src/routes/gestionLicencia.router.js src/controller/gestionLicencia.controller.js src/services/gestionLicencia.service.js src/security/access/resources.js tests/gestionLicencia.clientExport.test.js
git commit -m "feat: secure client medical leave exports"

cd ../front-cliente
git add src/modules/licencias/LicenciasManagement.jsx src/services/licenciasManagement.mjs src/services/clientServiceApi.js tests/licenciasManagement.test.mjs
git commit -m "feat: add client medical leave management table"
```

### Task 6: Compatibilidad y verificación integral

**Files:**
- Modify: legacy route wrappers under `src/app/(authenticated)/(dashboard)/dashboard/licencia-medica/` and `src/app/(authenticated)/(licencias)/licencia-medica/` only where necessary.
- Modify: `tests/licenciasWorkspace.test.mjs`
- Test: all frontend `.mjs` tests and relevant backend Jest tests.

**Interfaces:**
- Consumes: all preceding tasks.
- Produces: legacy URLs resolving to equivalent canonical sections without dropping query parameters.

- [ ] **Step 1: Add failing compatibility matrix tests**

Cubrir `/dashboard/licencia-medica/dashboard-global`, `/dashboard/licencia-medica/dashboard-operativo`, current `?tab=` keys, conciliación, ficha trabajador and canonical paths; assert query preservation.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/licenciasWorkspace.test.mjs`
Expected: FAIL for unmapped legacy entries.

- [ ] **Step 3: Implement wrappers without destructive route removal**

Render equivalent section or redirect while preserving query params. Avoid redirect loops and retain old detailed expediente route.

- [ ] **Step 4: Run complete verification**

Run: `node --test tests/*.test.mjs`
Expected: all PASS.

Run: `npm run build`
Expected: `Compiled successfully` and no new error.

Run: `npx -y react-doctor@latest . --verbose`
Expected: no new actionable finding in changed files.

Run: `cd ../backend && npm test -- tests/licenciaDashboard.globalContract.test.js tests/gestionLicencia.clientExport.test.js --runInBand`
Expected: PASS.

- [ ] **Step 5: Verify locally with the development client**

En `localhost:3002`, comprobar Analítico consolidado, Operativo sin consulta antes de elegir empresa, deep link desde ranking, cambio rápido de empresa, Gestiones paginada, detalle read-only, Excel individual y rutas legacy. Verificar al menos una empresa con acuerdos y otra sin acuerdos.

- [ ] **Step 6: Commit compatibility changes**

```bash
git add src/app tests/licenciasWorkspace.test.mjs
git commit -m "fix: preserve medical leave client routes"
```
