# INICIO.md — GOBi: Punto de entrada para el agente

> Lee este archivo primero en cada sesión nueva.
> Luego carga el skill específico que necesites de `/docs/skills/`.

---

## Qué es GOBi

Plataforma de inteligencia política para Costa Rica. Traduce la actividad
legislativa en información navegable, entendible y accionable.

**Stack:** Next.js 14 + TypeScript + Tailwind + shadcn/ui · FastAPI + SQLAlchemy 2.0 · PostgreSQL 15 · Clerk · React Query v5

---

## Estado actual del proyecto

> Última actualización: Fase 1 en progreso — Bloques 1 y 2 completos.
> Tag git: `v0.2-bloque1-completo`

```
[x] Fase 0 — Infraestructura base
[~] Fase 1 — Frontend base              ← EN PROGRESO
[ ] Fase 2 — Backend FastAPI
[ ] Fase 3 — Consumo de API
[ ] Fase 4 — Diseño UX
[ ] Fase 5 — Auth y roles
[ ] Fase 6 — Panel admin
[ ] Fase 7 — AI y escala
```

---

## Lo que existe hoy

```
frontend/src/
  types/
    index.ts                  ✅ Todos los tipos TypeScript

  data/mock/
    temas.ts                  ✅ 10 temas con TEMAS_BY_ID y TEMAS_BY_SLUG
    diputados.ts              ✅
    proyectos.ts              ✅
    comunicados.ts            ✅
    comisiones.ts             ✅

  lib/
    utils.ts                  ✅ cn(), formatearFecha(), formatearMoneda()

  components/
    ui/
      badge.tsx               ✅ shadcn base
      button.tsx              ✅ shadcn base
      card.tsx                ✅ shadcn base
      dialog.tsx              ✅ shadcn base
      separator.tsx           ✅ shadcn base
      skeleton.tsx            ✅ shadcn base
      table.tsx               ✅ shadcn base
      BadgeEstado.tsx         ✅ estados legislativos
      BadgePrioridad.tsx      ✅ urgente/en_debate/actualizado/seguido
      EmptyState.tsx          ✅ vacío y error
      SkeletonCard.tsx        ✅ loading
      TablaVotos.tsx          ✅ votos con resumen
      TimelineLegislativa.tsx ✅ historial de cambios

  ← PENDIENTE ────────────────────────────────────
  components/layout/
    Navbar.tsx                ❌  ← SIGUIENTE
  app/
    layout.tsx                ⚠️  actualizar: título, Navbar, metadata
    page.tsx                  ⚠️  placeholder — construir en Fase 1
    proyectos/                ❌
    diputados/                ❌
    comisiones/               ❌
  features/                   ❌ proyectos, diputados, comisiones, feed
```

---

## Hoja de ruta — Fase 1 (estado actual)

### Bloque 1 — Fundamentos ✅
```
[x] /src/types/index.ts
[x] /src/data/mock/temas.ts
[x] /src/data/mock/diputados.ts
[x] /src/data/mock/proyectos.ts
[x] /src/data/mock/comunicados.ts
[x] /src/data/mock/comisiones.ts
[x] /src/lib/utils.ts
```

### Bloque 2 — Componentes UI base ✅
```
[x] BadgeEstado.tsx
[x] BadgePrioridad.tsx
[x] EmptyState.tsx
[x] SkeletonCard.tsx
[x] TablaVotos.tsx
[x] TimelineLegislativa.tsx
```

### Bloque 3 — Layout ✅
```
[x] /src/components/layout/Navbar.tsx
[x] /src/app/layout.tsx   (título "GOBi", Navbar, metadata)
```

### Bloque 4 — Features y páginas ✅
```
[x] /src/features/proyectos/ProyectoCard.tsx
[x] /src/features/proyectos/FiltrosProyecto.tsx
[x] /src/app/proyectos/page.tsx
[x] /src/app/proyectos/[id]/page.tsx
[x] /src/app/diputados/page.tsx
[x] /src/app/page.tsx                (home: feed con BadgePrioridad)
```

### Checklist de cierre de Fase 1
```
[ ] Tipos definidos y sin errores TS
[ ] Mock data completo (proyectos con historial y votos)
[x] Feed home con jerarquía urgente/en_debate/actualizado
[x] Listado /proyectos con filtros en URL (estado, tema, búsqueda)
[x] Detalle /proyectos/[id] con timeline y tabla de votos
[x] Listado /diputados con card básica
[x] Navbar con links a todas las secciones
[x] EmptyState visible cuando no hay resultados
[ ] npm run build sin errores
```

---

## Reglas que el agente nunca debe romper

```
❌ No conectar APIs en Fase 1 — solo mock data
❌ No useState para filtros — siempre query params en URL
❌ No spinner genérico — siempre SkeletonCard
❌ No Badge de estado ad hoc — siempre BadgeEstado
❌ No componentes de +150 líneas — dividir
❌ No saltarse el orden de bloques
```

---

## Cómo usar este archivo

**Al iniciar una sesión:**
```
@INICIO.md @CREAR_COMPONENTE.md

Tarea: [describe exactamente qué construyes]
```

**Al terminar cada sesión:**
- Marca los checkboxes completados
- Haz commit con mensaje descriptivo
- Pon tag en hitos importantes (ej: v0.3-fase1-completa)

---

## Skills disponibles en /docs/skills/

```
SKILLS.md                        ← referencia maestra del stack
stack/REACT_QUERY.md
stack/FASTAPI.md
stack/CLERK.md
stack/SQLALCHEMY.md
stack/TAILWIND_SHADCN.md
tareas/CREAR_ENDPOINT.md
tareas/CREAR_COMPONENTE.md
tareas/CREAR_MIGRACION.md
tareas/AGREGAR_FILTRO.md
tareas/AGREGAR_MODULO.md
```