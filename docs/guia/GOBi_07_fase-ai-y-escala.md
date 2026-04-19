# GOBi — Fase 7: AI, Seguimiento y Escala

> **Objetivo:** Funciones que hacen el producto distintivo: AI con RAG, seguimiento personalizado, dashboards y despliegue serio.

> **Prerequisito:** Fases 1–6 completas. Backend y frontend operativos.

---

## Contexto para tu editor de IA

```
Proyecto: GOBi — plataforma de inteligencia política costarricense
Stack: Next.js + FastAPI + PostgreSQL + Redis + LangChain (RAG)
Fase: 7 — AI, seguimiento, dashboards, escala
Regla: estas funciones se construyen sobre base sólida. Si algo de atrás está roto, primero se arregla.
```

---

## Módulo 1: Integración AI (RAG)

### Endpoint en FastAPI

```python
# app/routers/ai.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.proyecto import ProyectoLey
from app.services.rag import rag_pipeline  # Tu sistema RAG

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/proyectos/{id}/resumen")
async def resumen_proyecto(id: UUID, db: Session = Depends(get_db)):
    proyecto = db.query(ProyectoLey).filter(ProyectoLey.id == id).first()
    if not proyecto:
        raise HTTPException(status_code=404)

    if not proyecto.texto_completo:
        return {"disponible": False, "motivo": "El proyecto no tiene texto completo cargado"}

    resultado = await rag_pipeline.analizar(
        texto=proyecto.texto_completo,
        titulo=proyecto.titulo,
        codigo=proyecto.codigo,
    )

    return {
        "disponible": True,
        "resumen": resultado.resumen,
        "puntos_clave": resultado.puntos_clave,
        "lenguaje_simple": resultado.explicacion_ciudadana,
        "sesgo_detectado": resultado.sesgo,
        "nivel_impacto": resultado.impacto,  # alto | medio | bajo
    }
```

### Componente frontend

```tsx
// /features/proyectos/ResumenAI.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export function ResumenAI({ proyectoId }: { proyectoId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ai-resumen", proyectoId],
    queryFn: async () => {
      const { data } = await api.get(`/ai/proyectos/${proyectoId}/resumen`);
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora — no recalcular en cada visita
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="border border-blue-200 rounded-xl p-4 animate-pulse space-y-3">
        <div className="h-4 bg-blue-100 rounded w-1/3" />
        <div className="h-3 bg-blue-100 rounded" />
        <div className="h-3 bg-blue-100 rounded w-5/6" />
      </div>
    );
  }

  if (isError || !data?.disponible) {
    return null; // No mostrar nada si no hay texto completo
  }

  const impactoClase = {
    alto:  "bg-red-50 border-red-200 text-red-700",
    medio: "bg-yellow-50 border-yellow-200 text-yellow-700",
    bajo:  "bg-green-50 border-green-200 text-green-700",
  }[data.nivel_impacto] || "bg-gray-50 border-gray-200 text-gray-600";

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-blue-700 font-semibold text-sm flex items-center gap-1.5">
          🤖 Análisis AI
        </span>
        {data.nivel_impacto && (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${impactoClase}`}>
            Impacto {data.nivel_impacto}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs text-blue-400 uppercase font-medium mb-1.5">Resumen</p>
        <p className="text-sm text-gray-800 leading-relaxed">{data.resumen}</p>
      </div>

      {data.puntos_clave?.length > 0 && (
        <div>
          <p className="text-xs text-blue-400 uppercase font-medium mb-1.5">Puntos clave</p>
          <ul className="space-y-1.5">
            {data.puntos_clave.map((punto: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-400 flex-shrink-0">▸</span>
                <span>{punto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 border border-blue-100">
        <p className="text-xs text-blue-400 uppercase font-medium mb-1.5">¿Qué significa para ti?</p>
        <p className="text-sm text-gray-700 leading-relaxed">{data.lenguaje_simple}</p>
      </div>

      {data.sesgo_detectado && (
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <p className="text-xs text-yellow-700">⚠️ Posible sesgo detectado: {data.sesgo_detectado}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Módulo 2: Seguimiento de proyectos

### Backend

Primero, definir el modelo (respetando la arquitectura del proyecto):

```python
# app/models/seguimiento.py  ← NO definir el Table dentro del router
from sqlalchemy import Table, Column, String, ForeignKey
from app.database import Base

# Tabla de seguimiento usuario <-> proyecto
seguimiento = Table(
    "seguimiento",
    Base.metadata,
    Column("usuario_id", String, primary_key=True),
    Column("proyecto_id", String, primary_key=True),
)
```

```bash
# Importar en alembic/env.py y migrar
from app.models import seguimiento
alembic revision --autogenerate -m "agregar_tabla_seguimiento"
alembic upgrade head
```

```python
# app/routers/seguimiento.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.seguimiento import seguimiento   # importar desde models, no definir aquí
from app.core.auth import get_current_user

router = APIRouter(prefix="/seguimiento", tags=["seguimiento"])

@router.get("/proyectos")
def mis_proyectos_seguidos(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.execute(
        seguimiento.select().where(seguimiento.c.usuario_id == user["user_id"])
    ).fetchall()
    ids = [str(r.proyecto_id) for r in rows]
    return {"proyecto_ids": ids, "total": len(ids)}

@router.post("/proyectos/{proyecto_id}")
def seguir_proyecto(proyecto_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ya_sigue = db.execute(
        seguimiento.select().where(
            (seguimiento.c.usuario_id == user["user_id"]) &
            (seguimiento.c.proyecto_id == str(proyecto_id))
        )
    ).first()
    if ya_sigue:
        return {"siguiendo": True}
    db.execute(seguimiento.insert().values(usuario_id=user["user_id"], proyecto_id=str(proyecto_id)))
    db.commit()
    return {"siguiendo": True}

@router.delete("/proyectos/{proyecto_id}")
def dejar_de_seguir(proyecto_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    db.execute(
        seguimiento.delete().where(
            (seguimiento.c.usuario_id == user["user_id"]) &
            (seguimiento.c.proyecto_id == str(proyecto_id))
        )
    )
    db.commit()
    return {"siguiendo": False}

@router.get("/proyectos/{proyecto_id}/estado")
def estado_seguimiento(proyecto_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    row = db.execute(
        seguimiento.select().where(
            (seguimiento.c.usuario_id == user["user_id"]) &
            (seguimiento.c.proyecto_id == str(proyecto_id))
        )
    ).first()
    return {"siguiendo": row is not None}
```

### Frontend

```tsx
// /features/proyectos/BotonSeguir.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useUsuario } from "@/hooks/useUsuario";

export function BotonSeguir({ proyectoId }: { proyectoId: string }) {
  const { isSignedIn } = useUsuario();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["siguiendo", proyectoId],
    queryFn: () => api.get(`/seguimiento/proyectos/${proyectoId}/estado`).then((r) => r.data),
    enabled: !!isSignedIn,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      data?.siguiendo
        ? api.delete(`/seguimiento/proyectos/${proyectoId}`)
        : api.post(`/seguimiento/proyectos/${proyectoId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["siguiendo", proyectoId] });
      qc.invalidateQueries({ queryKey: ["mis-seguidos"] });
    },
  });

  if (!isSignedIn) {
    return (
      <button
        disabled
        title="Inicia sesión para seguir proyectos"
        className="border border-gray-200 text-gray-400 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
      >
        + Seguir
      </button>
    );
  }

  if (isLoading) {
    return <div className="w-24 h-9 bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <button
      onClick={() => mutate()}
      disabled={isPending}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
        data?.siguiendo
          ? "bg-blue-100 text-blue-700 hover:bg-red-50 hover:text-red-600"
          : "border border-blue-500 text-blue-600 hover:bg-blue-50"
      }`}
    >
      {isPending ? "..." : data?.siguiendo ? "✓ Siguiendo" : "+ Seguir"}
    </button>
  );
}
```

---

## Módulo 3: Dashboard por diputado

```tsx
// /features/diputados/DashboardMetricas.tsx
import { MetricaCard } from "@/components/ui/MetricaCard";
import { formatearMoneda } from "@/lib/utils";

interface Metricas {
  totalProyectos: number;
  aprobados: number;
  archivados: number;
  votosAFavor: number;
  votosEnContra: number;
  abstenciones: number;
  salario: number;
  montoGasolina: number;
}

export function DashboardMetricas({ m }: { m: Metricas }) {
  const tasaAprobacion = m.totalProyectos
    ? Math.round((m.aprobados / m.totalProyectos) * 100)
    : 0;

  const totalVotos = m.votosAFavor + m.votosEnContra + m.abstenciones;
  const tasaAFavor = totalVotos ? Math.round((m.votosAFavor / totalVotos) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricaCard label="Proyectos" valor={m.totalProyectos} />
      <MetricaCard label="Aprobados" valor={m.aprobados}
        subtexto={`${tasaAprobacion}% del total`} colorClase="text-green-600" />
      <MetricaCard label="Votos a favor" valor={m.votosAFavor}
        subtexto={`${tasaAFavor}% del total`} />
      <MetricaCard label="Salario mensual" valor={formatearMoneda(m.salario)} />
      <MetricaCard label="Gasolina mensual" valor={formatearMoneda(m.montoGasolina)} />
      <MetricaCard label="Abstenciones" valor={m.abstenciones} />
      <MetricaCard label="Votos en contra" valor={m.votosEnContra} colorClase="text-red-500" />
      <MetricaCard label="Archivados" valor={m.archivados} colorClase="text-gray-400" />
    </div>
  );
}
```

---

## SEO con Next.js Metadata API

```typescript
// /app/proyectos/[id]/page.tsx — Metadata dinámica
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/proyectos/${params.id}`,
      { next: { revalidate: 300 } } // revalidar cada 5 min
    );
    if (!res.ok) throw new Error();
    const p = await res.json();
    return {
      title: `${p.titulo} | GOBi`,
      description: p.descripcion?.slice(0, 160),
      openGraph: {
        title: p.titulo,
        description: p.descripcion?.slice(0, 160),
        type: "article",
      },
    };
  } catch {
    return { title: "Proyecto de ley | GOBi" };
  }
}
```

---

## Checklist de despliegue

### Variables de entorno — Frontend (Vercel)

```bash
NEXT_PUBLIC_API_URL=https://api.gobi.cr
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
CLERK_SECRET_KEY=sk_live_xxxx
```

### Variables de entorno — Backend (Railway)

```bash
DATABASE_URL=postgresql://user:pass@host/gobi_prod
CLERK_SECRET_KEY=sk_live_xxxx
CLERK_WEBHOOK_SECRET=whsec_xxxx
CORS_ORIGINS=["https://gobi.cr","https://www.gobi.cr"]
```

### Checklist completo

```
Frontend (Vercel):
  [ ] Variables de entorno en producción
  [ ] Dominio personalizado configurado
  [ ] Redirección www → dominio principal

Backend (Railway):
  [ ] Variables de entorno en producción
  [ ] CORS con dominio real
  [ ] Health check endpoint respondiendo

Base de datos:
  [ ] Migraciones aplicadas (alembic upgrade head)
  [ ] Backups automáticos habilitados en Railway
  [ ] Índices en: proyectos.codigo, proyectos.estado, diputados.nombre

Clerk:
  [ ] Dominio de producción habilitado en dashboard
  [ ] Webhook apuntando a https://api.gobi.cr/webhooks/clerk
  [ ] JWT template configurado con campo "rol" en publicMetadata

Monitoreo:
  [ ] UptimeRobot o similar en https://api.gobi.cr/health
  [ ] Sentry instalado en frontend y backend
```

---

## Testing básico

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```typescript
// vitest.config.ts (raíz del proyecto) — REQUERIDO para que los tests corran
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

```typescript
// vitest.setup.ts (raíz del proyecto)
import "@testing-library/jest-dom";
```

```typescript
// /components/ui/BadgeEstado.test.tsx
import { render, screen } from "@testing-library/react";
import { BadgeEstado } from "./BadgeEstado";

describe("BadgeEstado", () => {
  it("muestra 'Aprobado' para estado aprobado", () => {
    render(<BadgeEstado estado="aprobado" />);
    expect(screen.getByText("Aprobado")).toBeInTheDocument();
  });

  it("muestra 'En comisión' para estado en_comision", () => {
    render(<BadgeEstado estado="en_comision" />);
    expect(screen.getByText("En comisión")).toBeInTheDocument();
  });

  it("aplica clase verde para aprobado", () => {
    const { container } = render(<BadgeEstado estado="aprobado" />);
    expect(container.firstChild).toHaveClass("text-green-800");
  });
});
```

---

## Regla Server vs Client Components

```
REGLA PRÁCTICA:

Server Component (default) cuando:
  - La página solo muestra datos (no hay useState, eventos)
  - Necesita SEO (páginas de detalle, listados públicos)
  - Hace fetch directamente en el servidor

Client Component ("use client") cuando:
  - Usa useState, useEffect, useRef
  - Maneja eventos del usuario (onClick, onChange)
  - Usa hooks de React Query (useQuery, useMutation)
  - Usa hooks de Clerk (useUser, useAuth)

Patrón en GOBi:
  /app/proyectos/[id]/page.tsx      → Server (metadata + wrapper)
  /features/proyectos/ProyectoDetalleClient.tsx → Client (useQuery)
  /features/proyectos/BotonSeguir.tsx           → Client (useMutation)
  /features/proyectos/FiltrosProyecto.tsx       → Client (useRouter)
```

---

## Entregable de Fase 7

- [ ] ResumenAI funcionando en detalle de proyecto (solo si hay texto_completo)
- [ ] BotonSeguir con estado persistente (requiere sesión)
- [ ] Página "Mis seguidos" en `/perfil/seguidos`
- [ ] Dashboard de diputado con `DashboardMetricas`
- [ ] Metadata SEO en todas las páginas públicas
- [ ] Tests para BadgeEstado, BadgePrioridad, EmptyState
- [ ] Checklist de despliegue completado
- [ ] UptimeRobot monitoreando el backend

---

## Prompts para tu editor de IA

```
Proyecto: GOBi — plataforma cívica costarricense
Stack: Next.js, TypeScript, Tailwind, React Query, FastAPI, PostgreSQL
Fase: 7 — AI, seguimiento y escala

Endpoint AI disponible: GET /ai/proyectos/{id}/resumen
Retorna: { disponible, resumen, puntos_clave, lenguaje_simple, sesgo_detectado, nivel_impacto }

Endpoints seguimiento:
  GET  /seguimiento/proyectos/{id}/estado → { siguiendo: bool }
  POST /seguimiento/proyectos/{id}        → seguir (requiere auth)
  DELETE /seguimiento/proyectos/{id}      → dejar de seguir (requiere auth)

Componentes disponibles: DashboardMetricas, ResumenAI, BotonSeguir

Regla Server/Client:
  - Páginas de detalle públicas → Server Component con generateMetadata
  - Componentes con hooks → Client Component ("use client")
  - ResumenAI usa staleTime de 1 hora

Tarea: [describe lo que construyes]
```

---

## Producto final

Cuando termines las 7 fases, GOBi será:

```
✅ Plataforma de inteligencia política funcional y navegable
✅ Datos reales de la Asamblea Legislativa de Costa Rica
✅ AI que explica proyectos en lenguaje ciudadano
✅ Transparencia: salarios, votaciones, asistencia por diputado
✅ Autenticación con roles diferenciados
✅ Panel admin con auditoría completa
✅ Seguimiento personalizado de proyectos
✅ SEO-friendly e indexable
✅ Desplegada y accesible al público
```

Eso es lo que Costa Rica no tiene todavía.
