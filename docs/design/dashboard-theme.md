# Dashboard Theme Tokens

Esta guía resume la paleta base acordada para el dashboard y los principales servicios (Moras Presuntas, Pagex y Licencias Médicas).

## Variables Globales

| Token | Hex | Uso sugerido |
| --- | --- | --- |
| `--surface` | `#FFFFFF` | Fondo principal de tarjetas y paneles |
| `--text-primary` | `#1F2229` | Texto principal |
| `--text-secondary` | `#5E6370` | Texto secundario, subtítulos |
| `--border-soft` | `rgba(255, 255, 255, 0.6)` | Bordes internos, divisiones suaves |
| `--shadow-elevated` | `0 30px 60px -40px rgba(33, 38, 52, 0.55)` | Sombras de tarjetas destacadas |

## Dashboard (Default)

| Token | Hex |
| --- | --- |
| `--dashboard-primary` | `#425AEF` |
| `--dashboard-primary-dark` | `#2A3CC3` |
| `--dashboard-accent` | `#9FAFFB` |
| `--dashboard-highlight` | `#FBD6C8` |
| `--dashboard-bg` | `#F5F7FF` |

Gradiente sugerido para fondo global:

```css
background: radial-gradient(circle at 20% 15%, rgba(66, 90, 239, 0.18), transparent 55%),
            radial-gradient(circle at 80% 90%, rgba(251, 214, 200, 0.2), transparent 45%),
            var(--dashboard-bg);
```

## Moras Presuntas

| Token | Hex |
| --- | --- |
| `--mora-primary` | `#FF3C41` |
| `--mora-primary-dark` | `#E03238` |
| `--mora-soft` | `#FFE6E7` |
| `--mora-accent` | `#FFD1D3` |
| `--mora-shadow` | `rgba(255, 60, 65, 0.35)` |

## Pagex

| Token | Hex |
| --- | --- |
| `--pagex-primary` | `#7354FF` |
| `--pagex-primary-dark` | `#5637D8` |
| `--pagex-soft` | `#E8E3FF` |
| `--pagex-accent` | `#BDA7FF` |
| `--pagex-highlight` | `rgba(150, 222, 255, 0.14)` |

## Licencias Médicas

| Token | Hex |
| --- | --- |
| `--licencias-primary` | `#2BB07B` |
| `--licencias-primary-dark` | `#1C7F57` |
| `--licencias-soft` | `#DDF7ED` |
| `--licencias-accent` | `#9DE8C7` |
| `--licencias-highlight` | `rgba(196, 244, 222, 0.22)` |

## Badges

Badges rectangulares con radio `6px`, altura `24px` y tipografía `font-semibold`:

| Contexto | Fondo | Texto |
| --- | --- | --- |
| Dashboard | `#E4E9FF` | `#2A3CC3` |
| Moras | `#FFE3E5` | `#C8232B` |
| Pagex | `#E7E1FF` | `#5132C6` |
| Licencias | `#D9F3E6` | `#16724D` |

Estas definiciones servirán como base para los temas de cada servicio dentro del `HubShell` y futuros componentes.
