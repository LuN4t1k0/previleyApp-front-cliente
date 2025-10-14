# Propuesta de rediseño para menú principal y footer

## Objetivos
- Alinear la navegación con el nuevo lenguaje visual (gradientes suaves, tarjetas elevadas, iconografía con "chips").
- Clarificar jerarquías y accesos frecuentes: acceso directo a módulos clave, agrupaciones limpias en escritorio, navegación collapsable en mobile.
- Incorporar un footer informativo que refuerce confianza (contacto, soporte, legal), inexistente actualmente.

## Menú principal (NavigationMenu)

### Layout
- **Wrapper**: barra fija con fondo translúcido sobre gradiente sutil.
  ```css
  background: linear-gradient(120deg, rgba(66,90,239,0.08), rgba(255,60,65,0.03));
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,0.6);
  ```
- **Container**: `max-w-6xl mx-auto px-6 py-4`, altura reducida (64px) para sensación compacta.
- **Estructura**:
  1. Izquierda: logo + selector de servicio (dropdown compacto que refleja el hub actual).
  2. Centro: navegación principal en formato "pill" (`Inicio`, `Servicios`, `Herramientas`, `Ayuda`, `Administración`).
  3. Derecha: módulo de usuario (avatar circular con estado) + botón de acceso rápido (`Soporte`, `Notificaciones`).
- **Hover/active**: pills con `background-color: rgba(255,255,255,0.75); color: var(--theme-primary); border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5);` Active determina la ruta actual.

### Dropdowns / mega paneles
- Panel flotante 320px con esquema glass: `bg-white/80`, `shadow-elevated`, borde `var(--border-soft)`.
- Contenido en tarjetas verticales (icon chip + texto). Añadir etiqueta de módulo con color propio (`theme` de módulo).
- Para categorías amplias (Servicios, Herramientas, Administración) usar grid 2 columnas.
- Mantener `menuItems` pero incluir `theme` opcional para heredar tokens en chips/iconos.

### Mobile
- Menú full-screen con fondo difuminado (`bg-white/85`), top con user block (avatar, nombre, mail) y quick actions.
- Items como acordeones, pero rediseñar Disclosure: header con icon chip, flecha rotativa y fondo `var(--theme-soft)`.
- Botón CTA fijo inferior: `Ir al Dashboard`, `Cerrar sesión`.

### Accesos rápidos propuestos
- Botón "Centro de ayuda" (icon RiCustomerService2Line) permanentemente visible.
- Badge para notificaciones con contador (integrable con `NotificationContext`).

### Tokens y clases nuevas
- `.nav-shell` (gradiente + blur), `.nav-pill`, `.nav-panel`, `.nav-icon-chip` reutilizando estilos de `HubShell`.
- Variables CSS dinámicas: `--nav-bg`, `--nav-border`, `--nav-pill-active` enlazadas a `--theme-primary`.

## Footer

### Objetivo
Agregar pie de página consistente (todos los layouts) con contacto, links rápidos y sello de confianza.

### Layout
- **Wrapper**: secciones en `bg` degradado inverso (suave, tonos grises con leve color del dashboard).
  ```css
  background: radial-gradient(circle at 0% 0%, rgba(66,90,239,0.06), transparent 55%),
              radial-gradient(circle at 100% 100%, rgba(43,176,123,0.08), transparent 45%),
              #f7f8fc;
  ```
- **Contenido**: `max-w-6xl mx-auto px-6 py-12` dividido en 3 columnas (desktop) → columna única stacking en mobile.
  1. **Marca**: logo + descripción corta + botones `LinkedIn`, `Email` (icon buttons).
  2. **Navegación**: listas (Servicios, Herramientas, Soporte, Administracion) reutilizando configuración.
  3. **Contacto**: datos directos (correo, teléfono, dirección) y CTA "Agendar demo".
- **Legal strip**: banda inferior 48px con borde superior `rgba(0,0,0,0.05)` mostrando copyright + política de privacidad/terminos.

### Componentización
- Crear `src/components/layout/AppFooter.jsx` con props opcionales para `accentTheme`.
- Reutilizar icon chips, badges (p.ej. certificados) para mantener estilo.
- Integrar en `src/app/layout.js` (global) debajo de `{children}` para vistas públicas; en vistas autenticadas, ubicarlo en `AuthenticatedLayout` después del `Toaster`.

### Contenido sugerido
- **Servicios**: enlaces a hubs (`/dashboard/mora-presunta`, `/dashboard/licencia-medica`, `/servicios/pagex`).
- **Recursos**: FAQs, Documentación, Blog (si aplica futuro).
- **Compañía**: Sobre nosotros, Contacto, Términos, Política de Privacidad.
- **CTA**: "¿Necesitas ayuda rápida?" botón `Contactar soporte` con icon `RiCustomerService2Line`.

## Implementación sugerida (alto nivel)
1. **Infraestructura visual**: añadir clases utilitarias en `globals.css` (`.nav-shell`, `.nav-pill`, `.footer-gradient`, `.footer-link`).
2. **NavigationMenu**:
   - Refactorizar layout para usar CSS grid/flex con nuevas clases.
   - Construir composición `NavSection` que renderiza icon chip + texto (desktop & mobile).
   - Añadir detección de ruta activa (via `usePathname`) para resaltar item.
   - Integrar quick actions (Help, Notifications) con placeholders.
3. **Footer**:
   - Crear componente `AppFooter` reutilizable.
   - Mapear links desde nuevo objeto de configuración (`config/footerLinks.js`).
   - Inyectar en layouts público y autenticado.
4. **Temas**: permitir `props.theme='mora|dashboard|...'` si más adelante se requieren footers contextuales.
5. **QA visual**: verificar responsive, contraste (AA), interacción con scroll.

## Próximos pasos
- Validar propuesta con stakeholders.
- Una vez aprobado, dividir trabajo en dos PRs: (1) estilos/base + footer, (2) refactor menú + quick actions.
