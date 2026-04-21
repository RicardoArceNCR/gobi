# INICIO.md — GOBi: Punto de entrada para el agente

> Lee este archivo primero en cada sesión nueva.
> Luego carga el skill específico que necesites de `/docs/skills/`.

---

## Qué es GOBi

Plataforma de inteligencia política para Costa Rica. Traduce la actividad
legislativa en información navegable, entendible y accionable.

**Stack:** Next.js 16.2.4 + React 19.2.4 + TypeScript + Tailwind CSS 4 + shadcn/ui · FastAPI 0.136.0 + SQLAlchemy 2.0 · PostgreSQL 15 · Clerk · React Query v5

---

## Estado actual del proyecto

> Última actualización: Fase 3.5 Hardening completa.
> Estado operativo real: Fase 3.5 — endurecimiento técnico finalizado.

[x] Fase 0 — Infraestructura base
[x] Fase 1 — Frontend base
[x] Fase 2 — Backend FastAPI
[x] Fase 3 — Consumo de API
[x] Fase 3.5 — Hardening técnico ✅
[ ] Fase 4 — Diseño UX
[ ] Fase 5 — Auth y roles
[ ] Fase 6 — Panel admin
[ ] Fase 7 — AI y escala

---

## Lo que existe hoy

```
frontend/src/
  types/
    index.ts                  ✅ Todos los tipos TypeScript
  data/mock/
    temas.ts                  ✅ (referencia estructural, no se usa en producción)
    diputados.ts              ✅
    proyectos.ts              ✅
    comunicados.ts            ✅
    comisiones.ts             ✅
  lib/
    utils.ts                  ✅ cn(), formatearFecha(), formatearMoneda()
  providers/
    QueryProvider.tsx         ✅ React Query v5 configurado
  services/
    api.ts                    ✅ instancia Axios + normalización de errores
    proyectos.ts              ✅ getProyectos(), getProyecto(), cambiarEstado()
    diputados.ts              ✅ getDiputados(), getDiputado()
    comisiones.ts             ✅ getComisiones(), getComision()
    partidos.ts               ✅ getPartidos()
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
      ListadoProyectos.tsx    ✅ conectado a API con 3 estados
      FeedLegislativo.tsx     ✅ feed home ordenado por prioridad
      ProyectoDetalleView.tsx ✅ detalle (refactorizado en subcomponentes)
      ProyectoHeader.tsx      ✅ subcomponente detalle
      ProyectoDocumentos.tsx  ✅ subcomponente detalle
      hooks.ts                ✅ useProyectos(), useProyecto(), useCambiarEstado()
    diputados/
      ListadoDiputados.tsx    ✅ conectado a API + paginación + links
      FiltrosDiputados.tsx    ✅ filtros por búsqueda y partido
      DiputadoDetalleView.tsx ✅ detalle completo
      hooks.ts                ✅ useDiputados(), useDiputado(), usePartidos()
    comisiones/
      ListadoComisiones.tsx   ✅ conectado a API + conteos + paginación
      ComisionDetalleView.tsx ✅ detalle completo
      hooks.ts                ✅ useComisiones(), useComision()
  app/
    layout.tsx                ✅ título GOBi, Navbar, QueryProvider, metadata
    page.tsx                  ✅ feed legislativo con FeedLegislativo
    proyectos/
      page.tsx                ✅ listado con filtros conectado a API
      [id]/page.tsx           ✅ detalle con ProyectoDetalleView
    diputados/
      page.tsx                ✅ usando ListadoDiputados (API) - 100% migrado
```

---

## Alertas actuales
- README público aún incompleto (en curso)
- Bitácora estratégica definida, falta implementación robusta
- Auth útil para backend existe, pero falta cerrar integración frontend completa
- Permisos formales definidos en estrategia, pendientes de middleware