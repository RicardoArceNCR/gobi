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

> Última actualización: Fase 1 completa.
> Tag git: `v0.4-fase1-completa`

```
[x] Fase 0 — Infraestructura base
[x] Fase 1 — Frontend base              ← COMPLETADA
[ ] Fase 2 — Backend FastAPI            ← SIGUIENTE
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
    temas.ts                  ✅
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
    layout/
      Navbar.tsx              ✅ con ruta activa

  features/
    proyectos/
      ProyectoCard.tsx        ✅
      FiltrosProyecto.tsx     ✅ filtros en URL con Suspense

  app/
    layout.tsx                ✅ título GOBi, Navbar, metadata
    page.tsx                  ✅ feed legislativo con BadgePrioridad
    proyectos/
      page.tsx                ✅ listado con filtros
      [id]/page.tsx           ✅ detalle con timeline y votos
    diputados/
      page.tsx                ✅ listado básico
```

---

## Fase 2 — Backend FastAPI

> Referencia completa: `/docs/guia/GOBi_02_fase-backend-fastapi.md`

### Lo que se construye
```
gobi-backend/
  app/
    main.py               ← FastAPI app + CORS + routers
    database.py           ← engine, SessionLocal, Base, get_db()
    models/
      proyecto.py         ← ProyectoLey, CambioEstado, Voto, Documento, Tema
      diputado.py         ← Diputado, Partido
      comision.py         ← Comision
      bitacora.py         ← EntradaBitacora
    schemas/
      proyecto.py         ← ProyectoResumenOut, ProyectoDetalleOut, etc.
      common.py           ← PaginatedResponse[T]
    routers/
      proyectos.py
      diputados.py
      comisiones.py
    services/
      bitacora.py
    core/
      config.py           ← Settings (pydantic-settings)
      auth.py             ← get_current_user(), require_admin()
```

### Endpoints mínimos para Fase 3
```
GET  /proyectos              ← listado paginado con filtros
GET  /proyectos/{id}         ← detalle completo
GET  /diputados              ← listado
GET  /diputados/{id}         ← perfil
GET  /comisiones             ← listado
GET  /comisiones/{id}        ← detalle con miembros
GET  /comunicados            ← feed
```

### Checklist de cierre de Fase 2
```
[ ] Proyecto Python creado con FastAPI + uvicorn
[ ] PostgreSQL conectado (local o Railway)
[ ] Modelos SQLAlchemy definidos y migrados con Alembic
[ ] Endpoints GET funcionando con datos reales
[ ] CORS configurado para localhost:3000
[ ] Schemas Pydantic para todos los endpoints
[ ] npm run build sin errores (frontend no se toca)
```

---

## Reglas que el agente nunca debe romper

```
❌ No modificar el frontend en Fase 2 — solo backend
❌ No auth casera — usar Clerk (se integra en Fase 5)
❌ No endpoints POST/PATCH aún — solo GET por ahora
❌ No saltarse migraciones Alembic — nunca editar DB a mano
❌ Siempre schemas Pydantic — nunca devolver modelos SQLAlchemy directos
❌ Siempre PaginatedResponse[T] para listados
```

---

## Cómo usar este archivo

**Al iniciar una sesión de Fase 2:**
```
@INICIO.md @FASTAPI.md

Tarea: [describe exactamente qué construyes]
```

**Al terminar cada sesión:**
- Marca los checkboxes completados
- Haz commit con mensaje descriptivo
- Pon tag en hitos (ej: v0.5-backend-base)

---

## Skills disponibles en /docs/skills/

```
SKILLS.md                        ← referencia maestra del stack
stack/REACT_QUERY.md
stack/FASTAPI.md                 ← usar en Fase 2
stack/CLERK.md
stack/SQLALCHEMY.md              ← usar en Fase 2
stack/TAILWIND_SHADCN.md
tareas/CREAR_ENDPOINT.md         ← usar en Fase 2
tareas/CREAR_COMPONENTE.md
tareas/CREAR_MIGRACION.md        ← usar en Fase 2
tareas/AGREGAR_FILTRO.md
tareas/AGREGAR_MODULO.md
```