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

> Actualiza esta sección manualmente conforme avances.

```
[ ] Fase 0 — Infraestructura base
[ ] Fase 1 — Frontend base
[ ] Fase 2 — Backend FastAPI
[ ] Fase 3 — Consumo de API
[ ] Fase 4 — Diseño UX
[ ] Fase 5 — Auth y roles
[ ] Fase 6 — Panel admin
[ ] Fase 7 — AI y escala
```

---

## Orden de ejecución recomendado

### Fase 0 — Infraestructura base (hacer primero, una sola vez)

```bash
# 1. Crear el repositorio frontend
npx create-next-app@latest gobi-frontend \
  --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
cd gobi-frontend

# 2. Instalar dependencias del stack
npm install @tanstack/react-query axios @clerk/nextjs
npm install clsx

# 3. Instalar shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add badge button card separator skeleton dialog toast table

# 4. Crear el proyecto backend
mkdir gobi-backend && cd gobi-backend
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary pydantic-settings \
            python-dotenv clerk-backend-api svix

# 5. Inicializar Alembic
alembic init alembic
```

```
Variables de entorno necesarias antes de continuar:

Frontend (.env.local):
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
  CLERK_SECRET_KEY=
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
  NEXT_PUBLIC_API_URL=http://localhost:8000

Backend (.env):
  DATABASE_URL=postgresql://user:pass@localhost:5432/gobi
  CLERK_SECRET_KEY=
  CLERK_WEBHOOK_SECRET=
  CORS_ORIGINS=http://localhost:3000
```

---

### Fase 1 — Frontend base

Archivos a crear en este orden:

```
1. /app/layout.tsx              ← ClerkProvider + QueryClientProvider + TokenProvider
2. /services/api.ts             ← instancia Axios + configurarToken()
3. /components/auth/TokenProvider.tsx
4. /components/auth/SoloParaRol.tsx
5. /hooks/useUsuario.ts
6. /components/ui/BadgeEstado.tsx
7. /components/ui/BadgePrioridad.tsx
8. /components/ui/EmptyState.tsx
9. /components/ui/SkeletonCard.tsx
10. /components/ui/MetricaCard.tsx
11. /components/layout/Navbar.tsx
12. /components/layout/Sidebar.tsx
13. /components/layout/AppLayout.tsx
14. /lib/utils.ts               ← cn(), formatearFecha(), formatearMoneda()
15. /types/index.ts             ← todos los tipos TypeScript
```

Skill de referencia: `docs/skills/stack/TAILWIND_SHADCN.md`

---

### Fase 2 — Backend FastAPI

Archivos a crear en este orden:

```
1. app/database.py              ← engine, SessionLocal, Base, get_db()
2. app/core/config.py           ← Settings con pydantic-settings
3. app/core/auth.py             ← get_current_user(), require_admin()
4. app/models/diputado.py       ← Diputado, Partido
5. app/models/comision.py       ← Comision
6. app/models/proyecto.py       ← ProyectoLey, CambioEstado, Voto, Documento, Tema
7. app/models/comunicado.py     ← Comunicado
8. app/models/bitacora.py       ← EntradaBitacora
9. app/schemas/common.py        ← PaginatedResponse[T]
10. app/schemas/proyecto.py
11. app/schemas/diputado.py
12. app/schemas/comision.py
13. app/schemas/comunicado.py
14. app/services/bitacora.py    ← registrar()
15. app/routers/proyectos.py
16. app/routers/diputados.py
17. app/routers/comisiones.py
18. app/routers/comunicados.py
19. app/routers/seguimiento.py
20. app/routers/webhooks.py
21. app/main.py                 ← FastAPI app + CORS + todos los routers
```

Luego ejecutar las migraciones:
```bash
# Importar todos los modelos en alembic/env.py primero
alembic revision --autogenerate -m "schema_inicial"
alembic upgrade head
```

Skills de referencia: `docs/skills/stack/FASTAPI.md`, `docs/skills/stack/SQLALCHEMY.md`

---

### Fase 3 — Consumo de API (frontend conectado al backend)

Por módulo, en este orden: proyectos → diputados → comisiones → comunicados.

Para cada módulo:
```
1. /services/{modulo}.ts
2. /features/{modulo}/hooks.ts
3. /features/{modulo}/{Modulo}Card.tsx
4. /features/{modulo}/Listado{Modulo}.tsx
5. /app/{modulo}/page.tsx
6. /app/{modulo}/[id]/page.tsx
```

Skill de referencia: `docs/skills/stack/REACT_QUERY.md`, `docs/skills/tareas/CREAR_COMPONENTE.md`

---

### Fase 4 — Diseño UX

Completar detalles visuales: `TimelineLegislativa`, `TablaVotos`, `InfoGrid`,
`SeccionDetalle`, `Paginacion`, `LinkInterno`. Ajustar responsive.

Skill de referencia: `docs/skills/stack/TAILWIND_SHADCN.md`

---

### Fase 5 — Auth y roles

```
1. middleware.ts                ← rutas protegidas con Clerk
2. /app/sign-in/[[...sign-in]]/page.tsx
3. /app/sign-up/[[...sign-up]]/page.tsx
4. /app/perfil/page.tsx
5. Webhook Clerk → asignar rol ciudadano al crear usuario
6. Verificar SoloParaRol en UI + require_admin en backend
```

Skill de referencia: `docs/skills/stack/CLERK.md`

---

### Fase 6 — Panel admin

```
1. /app/admin/page.tsx          ← dashboard
2. /features/admin/proyectos/FormularioProyecto.tsx
3. /features/admin/proyectos/PanelCambioEstado.tsx
4. /app/admin/proyectos/nuevo/page.tsx
5. /app/admin/proyectos/[id]/editar/page.tsx
6. /app/admin/bitacora/page.tsx
```

---

### Fase 7 — AI y escala

```
1. app/services/rag.py          ← pipeline LangChain
2. app/routers/ai.py            ← GET /ai/proyectos/{id}/resumen
3. /features/proyectos/ResumenAI.tsx
```

---

## Cómo pedirle tareas al agente

### Para crear algo nuevo

```
Lee docs/skills/SKILLS.md y docs/skills/tareas/CREAR_COMPONENTE.md,
luego crea el componente [nombre] en /features/[modulo]/.
El componente debe [descripción de lo que hace].
```

### Para agregar un módulo completo

```
Lee docs/skills/SKILLS.md y docs/skills/tareas/AGREGAR_MODULO.md,
luego implementa el módulo de [nombre] de punta a punta.
```

### Para agregar un filtro

```
Lee docs/skills/SKILLS.md y docs/skills/tareas/AGREGAR_FILTRO.md,
luego agrega el filtro [nombre] al módulo de [proyectos/diputados/etc].
```

### Para crear un endpoint

```
Lee docs/skills/SKILLS.md y docs/skills/tareas/CREAR_ENDPOINT.md,
luego crea el endpoint [MÉTODO] /[ruta] que [descripción].
```

---

## Reglas que el agente nunca debe romper

```
❌ Llamar API directo desde componente — siempre hook → service → API
❌ useState para filtros — siempre query params en URL
❌ Spinner genérico — siempre SkeletonCard
❌ Badge de estado ad hoc — siempre BadgeEstado
❌ Ocultar botón como única medida de seguridad (validar también en backend)
❌ Cambiar estado de proyecto sin campo motivo
❌ Componentes de más de 200 líneas
❌ Auth casera — siempre Clerk
```

---

## Archivos de referencia rápida

| Necesito saber sobre... | Leer este archivo |
|-------------------------|-------------------|
| Stack completo y patrones | `docs/skills/SKILLS.md` |
| React Query (useQuery, useMutation) | `docs/skills/stack/REACT_QUERY.md` |
| Endpoints FastAPI | `docs/skills/stack/FASTAPI.md` |
| Auth con Clerk | `docs/skills/stack/CLERK.md` |
| Modelos SQLAlchemy | `docs/skills/stack/SQLALCHEMY.md` |
| Estilos y componentes UI | `docs/skills/stack/TAILWIND_SHADCN.md` |
| Crear un componente React | `docs/skills/tareas/CREAR_COMPONENTE.md` |
| Crear un endpoint FastAPI | `docs/skills/tareas/CREAR_ENDPOINT.md` |
| Crear una migración Alembic | `docs/skills/tareas/CREAR_MIGRACION.md` |
| Agregar un filtro con URL | `docs/skills/tareas/AGREGAR_FILTRO.md` |
| Agregar un módulo completo | `docs/skills/tareas/AGREGAR_MODULO.md` |