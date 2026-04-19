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

> Última actualización: Fase 2 completa.
> Tag git: `v0.5-backend-base`

```
[x] Fase 0 — Infraestructura base
[x] Fase 1 — Frontend base
[x] Fase 2 — Backend FastAPI
[x] Fase 3 — Consumo de API             ← COMPLETADA
[ ] Fase 4 — Diseño UX                  ← SIGUIENTE
[ ] Fase 5 — Auth y roles
[ ] Fase 6 — Panel admin
[ ] Fase 7 — AI y escala
```

---

## Lo que existe hoy

### Frontend (Next.js)
```
src/types/index.ts                ✅ tipos TypeScript
src/data/mock/                    ✅ temas, diputados, proyectos, comunicados, comisiones
src/lib/utils.ts                  ✅ cn(), formatearFecha(), formatearMoneda()
src/components/ui/                ✅ BadgeEstado, BadgePrioridad, EmptyState,
                                     SkeletonCard, TablaVotos, TimelineLegislativa
src/components/layout/Navbar.tsx  ✅
src/features/proyectos/           ✅ ProyectoCard, FiltrosProyecto
src/app/                          ✅ /, /proyectos, /proyectos/[id], /diputados
```

### Backend (FastAPI)
```
gobi-backend/
  app/main.py                     ✅ FastAPI + CORS + routers
  app/core/config.py              ✅ Settings con pydantic-settings
  app/core/auth.py                ✅ get_current_user(), require_admin()
  app/database.py                 ✅ engine, SessionLocal, Base, get_db()
  app/models/                     ✅ proyecto, diputado, comision, bitacora
  app/routers/                    ✅ proyectos, diputados, comisiones
  app/schemas/                    ✅ proyecto, diputado, comision, common
  app/services/bitacora.py        ✅
  alembic/                        ✅ migración inicial aplicada
  .env                            ✅ DATABASE_URL + placeholders Clerk

DB: gobi_db (PostgreSQL local)
Tablas: bitacora, cambios_estado, comisiones, diputado_comision,
        diputados, documentos, partidos, proyecto_tema,
        proyectos_ley, temas, votos (12 tablas)

Endpoints disponibles en http://localhost:8000/docs:
  GET  /proyectos
  GET  /proyectos/{id}
  GET  /diputados
  GET  /diputados/{id}
  GET  /comisiones
  GET  /comisiones/{id}
```

---

## Fase 3 — Consumo de API desde el frontend

> Referencia completa: `/docs/guia/GOBi_03_fase-consumo-api.md`

### Lo que se construye
```
frontend/src/
  services/
    api.ts              ← instancia Axios + configurarToken()
    proyectos.ts        ← llamadas a /proyectos
    diputados.ts        ← llamadas a /diputados
    comisiones.ts       ← llamadas a /comisiones

  hooks/
    useProyectos.ts     ← useQuery wrapping services/proyectos
    useDiputados.ts
    useComisiones.ts

  features/proyectos/
    hooks.ts            ← useProyectos, useProyecto, filtros
```

### Cambios en páginas
```
Reemplazar mock data → useQuery hooks en:
  /app/page.tsx                   (feed)
  /app/proyectos/page.tsx         (listado)
  /app/proyectos/[id]/page.tsx    (detalle)
  /app/diputados/page.tsx         (listado)
```

### Checklist de cierre de Fase 3
```
[x] services/api.ts con instancia Axios apuntando a localhost:8000
[x] services/proyectos.ts, diputados.ts, comisiones.ts
[x] hooks useQuery para cada entidad
[x] Páginas usando hooks (no mock data)
[x] SkeletonCard visible durante carga
[x] EmptyState visible si no hay datos
[x] Filtros de URL funcionando contra API real
[x] npm run build sin errores
[x] Backend y frontend corriendo simultáneamente sin errores CORS
```

---

## Cómo levantar el entorno local

```bash
# Terminal 1 — Backend
cd /Users/ricardo/gobi/gobi-backend
source venv/bin/activate
uvicorn app.main:app --reload
# → http://localhost:8000/docs

# Terminal 2 — Frontend
cd /Users/ricardo/gobi/frontend
npm run dev
# → http://localhost:3000
```

---

## Reglas que el agente nunca debe romper

```
❌ No llamar API directo desde componente — siempre hook → service
❌ No useState para filtros — siempre query params en URL
❌ No spinner genérico — siempre SkeletonCard
❌ No eliminar mock data aún — mantener como fallback hasta Fase 3 estable
❌ Siempre los 3 estados: isLoading → isError → data
❌ Query keys centralizados en cada hooks.ts
```

---

## Cómo usar este archivo

**Al iniciar una sesión de Fase 3:**
```
@INICIO.md @REACT_QUERY.md

Tarea: [describe exactamente qué construyes]
```

**Al terminar cada sesión:**
- Marca los checkboxes completados
- Haz commit con mensaje descriptivo
- Tag en hitos (ej: v0.6-fase3-completa)

---

## Skills disponibles en /docs/skills/

```
SKILLS.md                        ← referencia maestra del stack
stack/REACT_QUERY.md             ← usar en Fase 3 ⭐
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