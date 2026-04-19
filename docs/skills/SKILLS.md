# SKILLS.md — GOBi Master Reference

> Pega este archivo completo como contexto al inicio de cualquier sesión con tu editor de IA.
> Para tareas específicas, combínalo con el skill correspondiente de `/skills/`.

---

## Qué es GOBi

**GOBi** — Plataforma de inteligencia cívica y observabilidad política para Costa Rica.

Traduce la actividad legislativa en información navegable, entendible y accionable. No es solo una app informativa — es un sistema que hace visible la estructura del poder y el movimiento de las decisiones públicas.

**Definición ejecutiva:**
> GOBi convierte datos públicos complejos en inteligencia cívica comprensible, conectada y personalizable.

**Ventajas competitivas:**
1. **Relacionalidad** — grafo de datos: diputado ↔ proyecto ↔ comisión ↔ partido
2. **Transparencia accionable** — salarios, gasolina, asistencia, votaciones individuales
3. **AI integrada** — resúmenes, análisis crítico, lenguaje simple (RAG propio)

---

## Stack completo

```
Frontend:    Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
Datos:       React Query v5 (@tanstack/react-query)
HTTP:        Axios
Auth:        Clerk
Backend:     FastAPI + Python 3.11
ORM:         SQLAlchemy 2.0
Migraciones: Alembic
Base datos:  PostgreSQL 15
Deploy:      Vercel (frontend) + Railway (backend + DB)
AI:          RAG propio con LangChain
```

---

## Estructura de carpetas — Frontend

```
/app                          ← Rutas (Next.js App Router)
  layout.tsx
  page.tsx                    ← Home / Feed
  /proyectos
    page.tsx
    /[id]/page.tsx
  /diputados/...
  /comisiones/...
  /admin/...                  ← Solo rol admin
  /perfil/...                 ← Solo autenticados

/components
  /layout                     ← Navbar, Sidebar, AppLayout
  /ui                         ← BadgeEstado, BadgePrioridad, EmptyState,
                                 SkeletonCard, TimelineLegislativa,
                                 TablaVotos, MetricaCard, InfoGrid,
                                 SeccionDetalle, Paginacion

/features
  /proyectos                  ← ProyectoCard, ListadoProyectos,
                                 FiltrosProyecto, hooks.ts
  /diputados                  ← DiputadoCard, DiputadoDetalle, hooks.ts
  /comisiones                 ← ComisionCard, hooks.ts
  /feed                       ← FeedItem
  /admin/proyectos            ← FormularioProyecto, PanelCambioEstado, schema.ts

/services
  api.ts                      ← instancia Axios + configurarToken()
  proyectos.ts
  diputados.ts
  comisiones.ts

/hooks
  useUsuario.ts               ← { isSignedIn, usuario: { rol, esAdmin } }

/types
  index.ts                    ← TODOS los tipos TypeScript

/lib
  utils.ts                    ← cn(), formatearFecha(), formatearMoneda()
```

---

## Estructura de carpetas — Backend

```
gobi-backend/
  app/
    main.py                   ← FastAPI app + CORS + routers
    database.py               ← engine, SessionLocal, Base, get_db()
    models/
      proyecto.py             ← ProyectoLey, CambioEstado, Voto, Documento, Tema
      diputado.py             ← Diputado, Partido
      comision.py             ← Comision
      bitacora.py             ← EntradaBitacora
    schemas/
      proyecto.py             ← ProyectoResumenOut, ProyectoDetalleOut,
                                 ProyectoCreate, ProyectoUpdate, CambioEstadoCreate
      common.py               ← PaginatedResponse[T]
    routers/
      proyectos.py
      diputados.py
      comisiones.py
      seguimiento.py
      ai.py
      webhooks.py
    services/
      bitacora.py             ← registrar()
      rag.py                  ← rag_pipeline.analizar()
    core/
      config.py               ← Settings (pydantic-settings)
      auth.py                 ← get_current_user(), require_admin()
      deps.py
```

---

## Tipos principales (TypeScript)

```typescript
type EstadoProyecto = "presentado" | "en_comision" | "en_debate" | "votado" | "aprobado" | "archivado"
type PrioridadFeed  = "urgente" | "en_debate" | "actualizado" | "seguido"
type RolUsuario     = "ciudadano" | "diputado" | "admin"
type ValorVoto      = "a_favor" | "en_contra" | "abstencion" | "ausente"

ProyectoLey   → id, codigo, titulo, descripcion, estado, proponente, comision, temas[], historial[], votos[], documentos[]
Diputado      → id, nombre, partido, salario, montoGasolina, comisiones[], proyectos[], votos[]
Comision      → id, nombre, miembros[], proyectos[]
Comunicado    → id, titulo, contenido, prioridad, proyectoId?, diputadoId?, comisionId?
CambioEstado  → estadoAnterior, estadoNuevo, motivo, fecha, usuarioNombre
Voto          → diputadoId, diputadoNombre, partido, valor
```

---

## Modelo de datos completo

```
Diputado        → Partido (many-to-one)
                → Comisiones (many-to-many)
                → Proyectos como proponente (one-to-many)
                → Votos (one-to-many)

ProyectoLey     → Diputado proponente (many-to-one)
                → Comision (many-to-one)
                → Temas (many-to-many)
                → CambioEstado[] historial (one-to-many)
                → Documento[] (one-to-many)
                → Voto[] (one-to-many)

Comunicado      → ProyectoLey? (nullable)
                → Diputado? (nullable)
                → Comision? (nullable)

EntradaBitacora → registra toda acción admin (creacion, edicion, cambio_estado)
```

---

## Patrones obligatorios

### 1. Flujo de datos (nunca saltarse capas)
```
Componente → Hook (useQuery/useMutation) → Service (Axios) → API
```

### 2. Siempre 3 estados en toda petición
```tsx
if (isLoading) return <SkeletonCard />   // nunca spinner genérico
if (isError)   return <EmptyState icono="⚠️" titulo="Error..." />
if (!data?.length) return <EmptyState icono="🔍" titulo="Sin resultados" />
return <>{data.map(...)}</>
```

### 3. Filtros siempre en URL
```tsx
// Nunca useState para filtros — siempre query params
const router = useRouter()
const params = useSearchParams()
router.push(`?${nuevosParams.toString()}`)
// URL resultante: /proyectos?estado=en_debate&tema=educacion&page=2
```

### 4. Query keys centralizados
```typescript
export const proyectosKeys = {
  all:    ["proyectos"] as const,
  list:   (f: Filtros) => ["proyectos", "list", f] as const,
  detail: (id: string) => ["proyectos", "detail", id] as const,
}
// Invalidar después de mutación:
qc.invalidateQueries({ queryKey: proyectosKeys.detail(id) })
```

### 5. Server vs Client Components
```
Server (default): páginas de detalle, SEO, fetch directo
Client ("use client"): useState, hooks React Query, hooks Clerk, eventos UI
```

### 6. Auth — ocultar ≠ proteger
```
SoloParaRol   → controla visibilidad en UI (UX)
require_admin → valida permisos reales en backend (seguridad)
Ambos son necesarios. Uno sin el otro está incompleto.
```

### 7. Mutaciones — siempre invalidar
```typescript
useMutation({
  mutationFn: (...) => api.post(...),
  onSuccess: () => qc.invalidateQueries({ queryKey: proyectosKeys.all }),
})
```

### 8. Cambios de estado — motivo obligatorio
```
Toda transición de estado de un proyecto requiere campo motivo (mínimo 10 chars).
Se registra en bitácora automáticamente.
```

---

## Transiciones válidas de estado

```
presentado  → en_comision | archivado
en_comision → en_debate   | archivado
en_debate   → votado      | archivado
votado      → aprobado    | archivado
aprobado    → (ninguna)
archivado   → (ninguna)
```

---

## Jerarquía del feed principal

```
🔴 URGENTE     → Proyecto con votación hoy o mañana
🟡 EN DEBATE   → Proyectos en discusión activa esta semana
🟢 ACTUALIZADO → Cambios de estado en últimas 48h
⚪ SEGUIDOS    → Actividad en proyectos que el usuario sigue
```

---

## Conexiones relacionales entre pantallas

```
Comunicado  → Proyecto relacionado → Diputado proponente → Partido
Proyecto    → Comisión → Miembros → Votos individuales
Diputado    → Sus proyectos → Sus comisiones → Su partido
```

---

## Endpoints del backend

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /proyectos | No | Listado paginado con filtros |
| GET | /proyectos/{id} | No | Detalle completo |
| POST | /proyectos | Admin | Crear |
| PATCH | /proyectos/{id} | Admin | Editar campos |
| PATCH | /proyectos/{id}/estado | Admin | Cambiar estado |
| GET | /diputados | No | Listado paginado |
| GET | /diputados/{id} | No | Perfil completo |
| GET | /comisiones | No | Listado |
| GET | /comisiones/{id} | No | Detalle con miembros |
| GET | /comunicados | No | Feed paginado |
| POST | /seguimiento/proyectos/{id} | Auth | Seguir |
| DELETE | /seguimiento/proyectos/{id} | Auth | Dejar de seguir |
| GET | /ai/proyectos/{id}/resumen | No | Resumen AI |
| GET | /bitacora | Admin | Historial de cambios |

---

## Componentes UI disponibles (no reinventar)

```
BadgeEstado          → estado legislativo (siempre este, nunca ad hoc)
BadgePrioridad       → urgente / en_debate / actualizado / seguido
EmptyState           → vacío y error (icono + titulo + descripcion?)
SkeletonCard         → loading (nunca spinner genérico)
TimelineLegislativa  → historial de cambios de estado
TablaVotos           → votos con resumen y tabla
MetricaCard          → número grande + label + subtexto?
InfoGrid             → grid de label/valor
SeccionDetalle       → título de sección + children + accion?
Paginacion           → prev/next con URL
LinkInterno          → link con estilo consistente
```

---

## Lo que NO hacer

```
❌ Llamar API directo desde un componente (siempre pasar por hook → service)
❌ useState para filtros (siempre query params en URL)
❌ Spinner genérico (siempre SkeletonCard)
❌ Badge de estado ad hoc (siempre BadgeEstado)
❌ Ocultar botón como única medida de seguridad (también validar en backend)
❌ Cambiar estado sin motivo
❌ Componentes de +200 líneas (dividir)
❌ Auth casera (usar Clerk)
❌ GraphQL, microservicios, sockets antes de tener base sólida
❌ Estado global (Zustand/Redux) antes de necesitarlo de verdad
```

---

## Skills disponibles en /skills/

```
SKILLS.md                          ← este archivo (maestro)
skills/stack/REACT_QUERY.md        ← cómo usar useQuery y useMutation
skills/stack/FASTAPI.md            ← cómo estructurar endpoints y schemas
skills/stack/CLERK.md              ← auth, roles, JWT en backend
skills/stack/SQLALCHEMY.md         ← modelos, relaciones, migraciones
skills/stack/TAILWIND_SHADCN.md    ← estilos y componentes UI
skills/tareas/CREAR_ENDPOINT.md    ← paso a paso para un endpoint FastAPI
skills/tareas/CREAR_COMPONENTE.md  ← paso a paso para un componente React
skills/tareas/CREAR_MIGRACION.md   ← paso a paso con Alembic
skills/tareas/AGREGAR_FILTRO.md    ← filtros en URL con query params
skills/tareas/AGREGAR_MODULO.md    ← cómo agregar un módulo nuevo completo
```

---

## Guía de fases en /guia/

```
guia/GOBi_00_vision-y-arquitectura.md   ← arquitectura + modelo de datos
guia/GOBi_01_fase-frontend-base.md      ← Fase 1: frontend con mock data
guia/GOBi_02_fase-backend-fastapi.md    ← Fase 2: backend FastAPI completo
guia/GOBi_03_fase-consumo-api.md        ← Fase 3: conectar frontend al backend
guia/GOBi_04_fase-diseno-ux.md          ← Fase 4: sistema de diseño
guia/GOBi_05_fase-auth-roles.md         ← Fase 5: auth y roles con Clerk
guia/GOBi_06_fase-admin.md              ← Fase 6: panel administrativo
guia/GOBi_07_fase-ai-y-escala.md        ← Fase 7: AI, dashboards, escala
```