# INICIO.md — GOBi: Punto de entrada para el agente

> Lee este archivo primero en cada sesión nueva.
> Luego carga el skill o documento específico que necesites de `/docs/skills/` o `/docs/guia/`.

---

## Qué es GOBi

GOBi es una plataforma de inteligencia política para Costa Rica.
Traduce la actividad legislativa en información navegable, entendible y accionable.

**Stack actual**
- Frontend: Next.js 16.2.4 + React 19.2.4 + TypeScript + Tailwind CSS 4 + shadcn/ui
- Datos frontend: React Query v5 + Axios
- Auth: Clerk
- Backend: FastAPI + SQLAlchemy 2
- Base de datos: PostgreSQL
- Migraciones: Alembic

---

## Estado actual del proyecto

> Última actualización real: Fase 3.5 en cierre técnico
> Estado operativo: base funcional + hardening antes de UX avanzada y panel admin

[x] Fase 0 — Infraestructura base
[x] Fase 1 — Frontend base
[x] Fase 2 — Backend FastAPI
[x] Fase 3 — Consumo de API
[~] Fase 3.5 — Hardening técnico ← ACTUAL
[ ] Fase 4 — Diseño UX
[ ] Fase 5 — Auth y roles
[ ] Fase 6 — Panel admin
[ ] Fase 7 — AI y escala

---

## Objetivo actual real

Antes de pasar a la siguiente fase, el objetivo no es agregar más features.

El objetivo actual es:

1. cerrar auth end-to-end entre Clerk, frontend y backend
2. estabilizar permisos por capability
3. validar migraciones de fechas y consistencia del dominio
4. terminar de sacar dependencias híbridas mock/API
5. dejar documentación base alineada con el estado real

---

## Lo que ya existe hoy

### Frontend
- layout global con ClerkProvider, Navbar y QueryProvider
- servicios conectados a API:
  - proyectos
  - diputados
  - comisiones
  - temas
- adapters para normalizar respuestas del backend
- hooks con React Query para listados, detalles y mutaciones
- componentes UI reutilizables:
  - BadgeEstado
  - BadgePrioridad
  - EmptyState
  - SkeletonCard
  - TimelineLegislativa
  - TablaVotos
  - Paginacion
- módulos operativos:
  - proyectos: listado, filtros, detalle, cambio de estado
  - diputados: listado y detalle
  - comisiones: listado y detalle
  - feed legislativo en home

### Backend
- routers operativos:
  - /proyectos
  - /diputados
  - /comisiones
  - /temas
- paginación homogénea
- filtros básicos por estado, tema, partido y búsqueda
- protección por capabilities en mutaciones de proyectos
- verificación de token Clerk en backend
- bitácora conectada a mutaciones principales de proyectos
- migraciones con Alembic
- seed demo funcional

---

## Estado técnico real

### Ya resuelto o bien encaminado
- arquitectura frontend consistente:
  - Componente → Hook → Service → API
- consumo real de `/temas` desde API
- permisos por capability en vez de checks manuales
- migración para pasar fechas string a tipo date
- normalización de datos con adapters

### Pendiente antes de avanzar de fase
- montar `AuthProvider` en el layout global para sincronizar token con Axios
- validar flujo completo login → token → request protegida → logout
- rotar y proteger llaves/secretos expuestos localmente
- terminar de revisar que no queden dependencias híbridas mock/API
- ampliar la cobertura de bitácora según próximas mutaciones
- actualizar README público para que refleje el estado real actual

---

## Alertas actuales

### 1. Auth aún no está cerrado end-to-end
Existe `AuthProvider`, pero si no está montado en el árbol principal, Clerk puede estar activo en UI sin asegurar que Axios mande token en toda la app.

### 2. Seguridad de secretos
Nunca subir ni compartir claves reales o completas en commits, snapshots o chats.
Si una clave fue expuesta, debe rotarse.

### 3. Fase 3.5 no se considera cerrada todavía
No pasar a UX avanzada, panel admin o nuevas capacidades grandes hasta cerrar:
- auth real
- fechas estables
- documentación base
- revisión final de integración

---

## Criterios para cerrar Fase 3.5

La fase actual se considera cerrada cuando:

- [ ] `AuthProvider` está integrado en el layout global
- [ ] frontend manda token correctamente a endpoints protegidos
- [ ] backend valida token y capabilities de forma consistente
- [ ] migraciones de fechas están aplicadas y validadas
- [ ] temas vienen 100% desde API
- [ ] README e INICIO reflejan el estado real
- [ ] no hay secretos expuestos en repositorio ni snapshots compartidos

---

## Regla operativa actual

Durante esta fase:

- sí:
  - corregir integración
  - endurecer permisos
  - limpiar deuda técnica real
  - alinear tipos, adapters y esquemas
  - documentar decisiones importantes

- no:
  - abrir panel admin completo
  - agregar nuevas features grandes
  - meter estado global innecesario
  - cambiar arquitectura base
  - iniciar AI/escala antes de cerrar la base

---

## Flujo de datos obligatorio

```txt
Componente → Hook (React Query) → Service (Axios) → Adapter → API