# TAREA: Agregar un módulo nuevo completo

> Checklist para agregar un módulo de punta a punta: modelo → endpoint → servicio → hook → componentes → página.
> Ejemplo: agregar el módulo de "Comunicados".

---

## Paso 1 — Modelo SQLAlchemy

```python
# app/models/comunicado.py
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class Comunicado(Base):
    __tablename__ = "comunicados"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo      = Column(String(300), nullable=False)
    contenido   = Column(Text, nullable=False)
    fuente      = Column(String(200), nullable=False)
    prioridad   = Column(String(20), nullable=False, default="actualizado")
    fecha       = Column(DateTime, nullable=False)

    # Relaciones opcionales (nullables)
    proyecto_id  = Column(UUID(as_uuid=True), ForeignKey("proyectos_ley.id"), nullable=True)
    diputado_id  = Column(UUID(as_uuid=True), ForeignKey("diputados.id"),     nullable=True)
    comision_id  = Column(UUID(as_uuid=True), ForeignKey("comisiones.id"),    nullable=True)

    proyecto = relationship("ProyectoLey", foreign_keys=[proyecto_id])
    diputado = relationship("Diputado",    foreign_keys=[diputado_id])
    comision = relationship("Comision",    foreign_keys=[comision_id])
```

---

## Paso 2 — Schema Pydantic

```python
# app/schemas/comunicado.py
from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID

class ComunicadoOut(BaseModel):
    id:              UUID
    titulo:          str
    contenido:       str
    fuente:          str
    prioridad:       str
    fecha:           str

    # FK y campos de relaciones — snake_case en backend
    proyecto_id:     Optional[UUID]
    proyecto_titulo: Optional[str]
    diputado_id:     Optional[UUID]
    diputado_nombre: Optional[str]
    comision_id:     Optional[UUID]
    comision_nombre: Optional[str]

    model_config = {"from_attributes": True}

    @field_validator("fecha", mode="before")
    def format_fecha(cls, v):
        return str(v)[:10] if v else ""

class ComunicadoCreate(BaseModel):
    titulo:      str
    contenido:   str
    fuente:      str
    prioridad:   str = "actualizado"
    fecha:       str
    proyecto_id:  Optional[UUID] = None
    diputado_id:  Optional[UUID] = None
    comision_id:  Optional[UUID] = None
```

---

## Paso 3 — Router FastAPI

```python
# app/routers/comunicados.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.comunicado import Comunicado
from app.schemas.comunicado import ComunicadoOut, ComunicadoCreate
from app.schemas.common import PaginatedResponse
from app.core.auth import require_admin

router = APIRouter(prefix="/comunicados", tags=["comunicados"])

@router.get("", response_model=PaginatedResponse[ComunicadoOut])
def listar_comunicados(
    prioridad: Optional[str] = None,
    page:      int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Comunicado).order_by(Comunicado.fecha.desc())
    if prioridad:
        q = q.filter(Comunicado.prioridad == prioridad)

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total, "page": page,
            "page_size": page_size, "total_pages": -(-total // page_size)}

@router.post("", response_model=ComunicadoOut, status_code=201)
def crear_comunicado(
    body: ComunicadoCreate,
    db:   Session = Depends(get_db),
    user  = Depends(require_admin),
):
    comunicado = Comunicado(**body.model_dump())
    db.add(comunicado)
    db.commit()
    db.refresh(comunicado)
    return comunicado
```

---

## Paso 4 — Registrar en main.py

```python
# app/main.py
from app.routers import comunicados    # ← agregar

app.include_router(comunicados.router)
```

---

## Paso 5 — Migración

```bash
# Importar en alembic/env.py
from app.models import comunicado

# Generar y aplicar
alembic revision --autogenerate -m "agregar_tabla_comunicados"
alembic upgrade head
```

---

## Paso 6 — Tipo TypeScript

El backend devuelve campos en **snake_case**. El tipo TypeScript debe reflejar
exactamente lo que llega de la API — no convertir a camelCase salvo que
uses un interceptor Axios que lo haga automáticamente.

```typescript
// /types/index.ts — agregar
export interface Comunicado {
  id:              string;
  titulo:          string;
  contenido:       string;
  fuente:          string;
  prioridad:       PrioridadFeed;
  fecha:           string;
  proyecto_id:     string | null;
  proyecto_titulo: string | null;
  diputado_id:     string | null;
  diputado_nombre: string | null;
  comision_id:     string | null;
  comision_nombre: string | null;
}
```

---

## Paso 7 — Servicio frontend

```typescript
// /services/comunicados.ts
import { api } from "./api";

export interface FiltrosComunicados {
  prioridad?: string;
  page?:      number;
}

export async function getComunicados(filtros: FiltrosComunicados = {}) {
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, v]) => v !== undefined && v !== "")
  );
  const { data } = await api.get("/comunicados", { params });
  return data;
}
```

---

## Paso 8 — Hooks

```typescript
// /features/comunicados/hooks.ts
import { useQuery } from "@tanstack/react-query";
import { getComunicados, FiltrosComunicados } from "@/services/comunicados";

export const comunicadosKeys = {
  all:  ["comunicados"] as const,
  list: (f: FiltrosComunicados) => ["comunicados", "list", f] as const,
};

export function useComunicados(filtros: FiltrosComunicados = {}) {
  return useQuery({
    queryKey: comunicadosKeys.list(filtros),
    queryFn:  () => getComunicados(filtros),
  });
}
```

---

## Paso 9 — Componentes

```tsx
// /features/comunicados/FeedItem.tsx
import Link from "next/link";
import { Comunicado } from "@/types";
import { BadgePrioridad } from "@/components/ui/BadgePrioridad";

export function FeedItem({ comunicado }: { comunicado: Comunicado }) {
  return (
    <article className="border rounded-xl p-4 bg-white hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <BadgePrioridad prioridad={comunicado.prioridad} />
        <span className="text-xs text-gray-400">{comunicado.fecha}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{comunicado.titulo}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{comunicado.contenido}</p>

      {/* Conexiones relacionales — usar snake_case igual que llega de la API */}
      <div className="flex gap-2 flex-wrap text-xs">
        {comunicado.proyecto_id && (
          <Link href={`/proyectos/${comunicado.proyecto_id}`}
            className="bg-blue-50 text-blue-600 hover:underline px-2 py-0.5 rounded">
            📋 {comunicado.proyecto_titulo?.slice(0, 40)}...
          </Link>
        )}
        {comunicado.diputado_id && (
          <Link href={`/diputados/${comunicado.diputado_id}`}
            className="bg-purple-50 text-purple-600 hover:underline px-2 py-0.5 rounded">
            👤 {comunicado.diputado_nombre}
          </Link>
        )}
        {comunicado.comision_id && (
          <Link href={`/comisiones/${comunicado.comision_id}`}
            className="bg-green-50 text-green-600 hover:underline px-2 py-0.5 rounded">
            🏛️ {comunicado.comision_nombre}
          </Link>
        )}
      </div>
    </article>
  );
}
```

```tsx
// /features/comunicados/ListadoComunicados.tsx
"use client";
import { useComunicados } from "./hooks";
import { FeedItem } from "./FeedItem";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FiltrosComunicados } from "@/services/comunicados";

export function ListadoComunicados({ filtros = {} }: { filtros?: FiltrosComunicados }) {
  const { data, isLoading, isError } = useComunicados(filtros);

  if (isLoading) return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
  if (isError) return <EmptyState icono="⚠️" titulo="Error al cargar el feed" />;
  if (!data?.items?.length) return <EmptyState icono="📭" titulo="Sin comunicados" />;

  return (
    <div className="space-y-4">
      {data.items.map((c: Comunicado) => <FeedItem key={c.id} comunicado={c} />)}
    </div>
  );
}
```

---

## Paso 10 — Página

```tsx
// /app/comunicados/page.tsx
import { ListadoComunicados } from "@/features/comunicados/ListadoComunicados";

export default function ComunicadosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        ¿Qué está pasando HOY en la Asamblea?
      </h1>
      <ListadoComunicados />
    </div>
  );
}
```

---

## Paso 11 — Agregar al Sidebar

```tsx
// /components/layout/Sidebar.tsx — agregar entrada
{ href: "/comunicados", icono: "📰", label: "Comunicados" },
```

---

## Checklist completo

```
Backend:
[ ] Modelo SQLAlchemy creado en app/models/{modulo}.py
[ ] Schema Out con model_config from_attributes
[ ] Schema Create y Update
[ ] Router con GET lista, GET detalle, POST (y PATCH si aplica)
[ ] Router registrado en app/main.py
[ ] Modelo importado en alembic/env.py
[ ] Migración generada y aplicada
[ ] Endpoints verificados en /docs

Frontend:
[ ] Tipo TypeScript agregado en /types/index.ts (campos en snake_case igual que la API)
[ ] Servicio en /services/{modulo}.ts
[ ] Query keys en /features/{modulo}/hooks.ts
[ ] Hook useXxx() con useQuery
[ ] Componente Card o Item para listado (usar snake_case al acceder a campos de la API)
[ ] Componente Listado con 3 estados (loading, error, vacío)
[ ] Página en /app/{modulo}/page.tsx
[ ] Ruta agregada al Sidebar
[ ] Filtros si aplica (ver AGREGAR_FILTRO.md)
```
