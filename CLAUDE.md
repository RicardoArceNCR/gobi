# CLAUDE.md — Reglas permanentes del agente en GOBi

> Este archivo es leído automáticamente en cada sesión.
> No necesitas mencionarlo. Contiene reglas que nunca cambian.

---

## Identidad del proyecto

GOBi es una plataforma de inteligencia política para Costa Rica.
Stack: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
Backend: FastAPI + SQLAlchemy 2.0 + PostgreSQL 15
Auth: Clerk · Datos: React Query v5 · HTTP: Axios

---

## Reglas de arquitectura — NUNCA romper

### Flujo de datos
```
Componente → Hook (useQuery/useMutation) → Service (Axios) → API
```
Nunca llamar a la API directamente desde un componente.

### Filtros siempre en URL
```tsx
// ✅ Correcto
const router = useRouter()
const params = useSearchParams()
router.push(`?${nuevosParams.toString()}`)

// ❌ Incorrecto
const [estado, setEstado] = useState("")
```

### Siempre 3 estados en peticiones
```tsx
if (isLoading) return <SkeletonCard />         // nunca spinner genérico
if (isError)   return <EmptyState icono="⚠️" titulo="Error al cargar" />
if (!data?.length) return <EmptyState icono="🔍" titulo="Sin resultados" />
return <>{data.map(...)}</>
```

### Componentes pequeños
- Máximo ~150 líneas por archivo
- Una responsabilidad por componente
- Si crece, dividir en subcomponentes

---

## Componentes UI — usar siempre los existentes

```
BadgeEstado         → estado legislativo (nunca crear uno ad hoc)
BadgePrioridad      → urgente / en_debate / actualizado / seguido
EmptyState          → vacío y error
SkeletonCard        → loading (nunca spinner genérico)
TimelineLegislativa → historial de cambios de estado
TablaVotos          → votos con resumen y tabla
```

Ubicación: `/components/ui/`
Los componentes shadcn base están en `/components/ui/` (badge, button, card, dialog, separator, skeleton, table).

---

## Convenciones de código

### Nombres de archivos
```
PascalCase   → componentes React:   ProyectoCard.tsx, BadgeEstado.tsx
camelCase    → hooks y utils:       useProyectos.ts, formatearFecha.ts
kebab-case   → rutas Next.js:       /proyectos/[id]/page.tsx
```

### Imports — orden
```tsx
// 1. React y Next
import { useState } from "react"
import Link from "next/link"

// 2. Librerías externas
import { useQuery } from "@tanstack/react-query"

// 3. Internos — tipos
import type { ProyectoLey } from "@/types"

// 4. Internos — componentes y utils
import { BadgeEstado } from "@/components/ui/BadgeEstado"
import { formatearFecha } from "@/lib/utils"
```

### TypeScript
- Siempre tipar props explícitamente
- Usar los tipos de `/types/index.ts` — nunca definir tipos inline en componentes
- Preferir `interface` sobre `type` para props de componentes

---

## Estructura de carpetas — respetar siempre

```
/app                  → rutas (Next.js App Router)
/components/ui        → componentes UI reutilizables
/components/layout    → Navbar, Sidebar, AppLayout
/features/{modulo}    → componentes específicos de cada módulo
/data/mock            → datos mock (solo Fase 1)
/services             → llamadas a API con Axios
/hooks                → hooks personalizados (useQuery wrappers)
/types                → index.ts con todos los tipos
/lib                  → utils.ts y helpers
/docs                 → guías y skills del proyecto
```

---

## Server vs Client Components

```
Server (default):  páginas de detalle, SEO, fetch inicial
Client ("use client"): useState, useQuery, hooks de Clerk, eventos UI
```

Regla: empezar como Server Component. Agregar `"use client"` solo cuando sea necesario.

---

## Auth (Fase 5+)

```
UI:      ocultar elementos con verificación de rol → UX
Backend: require_admin() en endpoints → seguridad real
```
Ambos son necesarios. Uno sin el otro está incompleto.

---

## Mutaciones — siempre invalidar

```typescript
useMutation({
  mutationFn: (...) => api.post(...),
  onSuccess: () => qc.invalidateQueries({ queryKey: proyectosKeys.all }),
})
```

---

## Cambios de estado de proyectos

Toda transición requiere campo `motivo` (mínimo 10 caracteres).
Se registra automáticamente en bitácora.

Transiciones válidas:
```
presentado  → en_comision | archivado
en_comision → en_debate   | archivado
en_debate   → votado      | archivado
votado      → aprobado    | archivado
aprobado    → (ninguna)
archivado   → (ninguna)
```

---

## Lo que NUNCA hacer

```
❌ Llamar API directo desde componente
❌ useState para filtros (siempre query params)
❌ Spinner genérico (siempre SkeletonCard)
❌ Badge de estado ad hoc (siempre BadgeEstado)
❌ Componentes de +150 líneas sin dividir
❌ Tipos definidos inline en componentes
❌ Auth casera (usar Clerk)
❌ GraphQL, microservicios, sockets (no están en el plan)
❌ Estado global (Zustand/Redux) sin necesidad real
❌ Cambiar estado de proyecto sin campo motivo
```

---

## Al generar código

1. Respetar la estructura de carpetas exacta
2. Usar los tipos de `/types/index.ts` — nunca inventar tipos nuevos sin consultarlo
3. Si un componente UI ya existe, usarlo — no crear uno nuevo similar
4. Incluir siempre el path del archivo como comentario en la primera línea
5. Si hay ambigüedad, preguntar antes de asumir