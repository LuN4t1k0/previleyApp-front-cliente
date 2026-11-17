# Dashboards de servicios del portal cliente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir dashboards analíticos funcionales para Cargas Familiares, Depósitos Convenidos y Notificaciones Previsionales.

**Architecture:** Una configuración por servicio alimenta un agregador puro y un único componente React reutilizable. Las rutas existentes resuelven la clave canónica y montan el dashboard correspondiente sin cambios de API.

**Tech Stack:** Next.js 14, React 18, Axios, Tremor, Remix Icon, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-17-dashboards-servicios-cliente-design.md`

## Global Constraints

- No agregar dependencias.
- Mantener el alcance de empresas impuesto por el backend.
- No habilitar acciones de escritura al cliente.
- Mostrar un estado vacío útil cuando no existan gestiones.

## Review Focus

- Respuesta vacía: debe renderizar KPI en cero y un estado vacío, no fallar.
- Estados con mayúsculas o separadores: deben agruparse de forma estable y verse humanizados.
- Empresa desconocida o sin nombre: debe usar el RUT como etiqueta.
- Valores numéricos serializados como texto: deben sumarse como números.
- Servicio sin definición: debe terminar la carga y presentar un error explícito.

---

### Task 1: Contrato analítico compartido

**Files:**
- Create: `src/services/operationalServiceDashboard.mjs`
- Test: `tests/operationalServiceDashboard.test.mjs`

**Interfaces:**
- Produces: `aggregateOperationalDashboard(rows, definition, apiTotal)` y `humanizeStatus(value)`.

- [ ] Escribir pruebas fallidas para resumen, estados, empresas, línea temporal, valores vacíos y normalización.
- [ ] Ejecutar `node --test tests/operationalServiceDashboard.test.mjs` y confirmar fallo por módulo inexistente.
- [ ] Implementar el agregador mínimo.
- [ ] Repetir la prueba y confirmar que pasa.

### Task 2: Cliente API y definiciones

**Files:**
- Create: `src/config/operationalServiceDashboards.js`
- Modify: `src/services/clientServiceApi.js`
- Modify: `src/hooks/useServiceDashboard.js`

**Interfaces:**
- Consumes: `aggregateOperationalDashboard` de Task 1.
- Produces: fetchers para `cargas-familiares`, `depositos-convenidos` y `notificaciones-previsionales`.

- [ ] Añadir una prueba fallida que valide claves, endpoints y campos de volumen.
- [ ] Registrar definiciones y un fetcher común con `limit=500` y filtro opcional por empresa.
- [ ] Registrar los tres fetchers y garantizar que una clave no soportada finaliza con error.
- [ ] Ejecutar las pruebas del agregador.

### Task 3: Dashboard React reutilizable

**Files:**
- Create: `src/modules/operational-services/OperationalServiceDashboard.jsx`
- Modify: `src/app/(authenticated)/servicios/[service]/page.jsx`

**Interfaces:**
- Consumes: `useServiceDashboard(serviceKey, empresaRut, range)` y configuración del servicio.
- Produces: panel con KPI, distribución, ranking, evolución y gestiones recientes.

- [ ] Integrar selector “Todas las empresas” y estados loading/error/empty.
- [ ] Renderizar KPI y paneles siguiendo la jerarquía visual del analítico de Mora.
- [ ] Enrutar las tres claves nuevas al componente reutilizable.
- [ ] Corregir la búsqueda de asignaciones canónicas en la vista genérica.

### Task 4: Verificación integral

**Files:**
- Modify sólo si las verificaciones encuentran defectos de la implementación.

- [ ] Ejecutar pruebas unitarias.
- [ ] Ejecutar `npm run build`.
- [ ] Ejecutar React Doctor sobre el diff y corregir errores nuevos.
- [ ] Consultar los tres endpoints con `cliente.test@previley.cl` y verificar que cada dashboard recibe datos.

