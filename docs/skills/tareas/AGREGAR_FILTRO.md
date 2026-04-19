# TAREA: Agregar filtros con query params en URL

> Patrón completo: filtros en URL → conectados a API → sin useState.

---

## Por qué en URL y no en useState

```
useState → se pierde al recargar, no se puede compartir el link, Back no funciona
URL      → persistente, compartible, navegable con Back/Forward, indexable
```

---

## Paso 1 — Agregar parámetro en el backend

```python
# app/routers/proyectos.py

@router.get("", response_model=PaginatedResponse[ProyectoResumenOut])
def listar_proyectos(
    # Agregar el nuevo filtro aquí
    partido:  Optional[str] = None,        # ← NUEVO
    estado:   Optional[EstadoProyecto] = None,
    busqueda: Optional[str] = None,
    page:     int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(ProyectoLey)

    if estado:   q = q.filter(ProyectoLey.estado == estado)
    if busqueda: q = q.filter(ProyectoLey.titulo.ilike(f"%{busqueda}%"))

    # Filtro nuevo por partido
    if partido:
        from app.models.diputado import Diputado, Partido
        q = (q
             .join(Diputado, ProyectoLey.proponente_id == Diputado.id)
             .join(Partido, Diputado.partido_id == Partido.id)
             .filter(Partido.nombre.ilike(f"%{partido}%")))

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total, "page": page,
            "page_size": page_size, "total_pages": -(-total // page_size)}
```

---

## Paso 2 — Actualizar el tipo de filtros en el frontend

```typescript
// /services/proyectos.ts

export interface FiltrosProyecto {
  estado?:   EstadoProyecto | "";
  tema?:     string;
  partido?:  string;          // ← NUEVO
  busqueda?: string;
  page?:     number;
}

export async function getProyectos(filtros: FiltrosProyecto = {}) {
  // Limpiar vacíos antes de enviar
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, v]) => v !== "" && v !== undefined)
  );
  const { data } = await api.get("/proyectos", { params });
  return data;
}
```

---

## Paso 3 — Agregar el control en el componente de filtros

```tsx
// /features/proyectos/FiltrosProyecto.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

// Datos para el selector de partido (mock o desde API)
const PARTIDOS = ["PLN", "PUSC", "FA", "PLP", "PNG", "PRD"];

export function FiltrosProyecto() {
  const router = useRouter();
  const params = useSearchParams();

  // Función centralizada para cambiar cualquier filtro
  const set = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    p.delete("page");          // siempre resetear página al filtrar
    router.push(`?${p.toString()}`);
  };

  const hayFiltros = params.get("estado") || params.get("tema") ||
                     params.get("partido") || params.get("busqueda");

  return (
    <div className="flex gap-2 flex-wrap items-center">

      {/* Búsqueda por texto */}
      <input
        type="search"
        placeholder="Buscar..."
        defaultValue={params.get("busqueda") || ""}
        onChange={(e) => set("busqueda", e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm w-56
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Filtro por estado */}
      <select
        value={params.get("estado") || ""}
        onChange={(e) => set("estado", e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los estados</option>
        <option value="presentado">Presentado</option>
        <option value="en_comision">En comisión</option>
        <option value="en_debate">En debate</option>
        <option value="votado">Votado</option>
        <option value="aprobado">Aprobado</option>
        <option value="archivado">Archivado</option>
      </select>

      {/* Filtro por partido — NUEVO */}
      <select
        value={params.get("partido") || ""}
        onChange={(e) => set("partido", e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los partidos</option>
        {PARTIDOS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Limpiar todos los filtros */}
      {hayFiltros && (
        <button
          onClick={() => router.push("/proyectos")}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
```

---

## Paso 4 — Leer los filtros desde la página y pasarlos al hook

```tsx
// /app/proyectos/page.tsx
interface Props {
  searchParams: {
    estado?:   string;
    tema?:     string;
    partido?:  string;    // ← NUEVO
    busqueda?: string;
    page?:     string;
  };
}

export default function ProyectosPage({ searchParams }: Props) {
  const filtros = {
    estado:   searchParams.estado as EstadoProyecto | undefined,
    tema:     searchParams.tema,
    partido:  searchParams.partido,       // ← NUEVO
    busqueda: searchParams.busqueda,
    page:     searchParams.page ? parseInt(searchParams.page) : 1,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <FiltrosProyecto />
      <ListadoProyectosWrapper filtros={filtros} />
    </div>
  );
}
```

---

## Paso 5 — El hook ya pasa los filtros a la API

```typescript
// /features/proyectos/hooks.ts — no cambia nada aquí
// El queryKey ya incluye los filtros, así que React Query
// hará un nuevo fetch automáticamente cuando cambien

export function useProyectos(filtros: FiltrosProyecto = {}) {
  return useQuery({
    queryKey: proyectosKeys.list(filtros),   // ← filtros en el key
    queryFn:  () => getProyectos(filtros),
  });
}
```

---

## URL resultante

```
/proyectos?estado=en_debate&partido=PLN&busqueda=educacion&page=1
```

Esta URL es:
- Compartible (copiar y pegar funciona)
- Navegable (Back/Forward del browser funciona)
- Persistente (recargar mantiene los filtros)
- SEO-friendly (los bots pueden indexar resultados filtrados)

---

## Checklist

```
[ ] Parámetro agregado en el endpoint FastAPI con Optional[str] = None
[ ] Lógica de filtrado en el query de SQLAlchemy
[ ] Tipo FiltrosProyecto actualizado en /services/proyectos.ts
[ ] Control (input, select) agregado en FiltrosProyecto.tsx
  [ ] Usa useSearchParams() para leer valor actual
  [ ] Usa router.push() para actualizar URL
  [ ] Resetea page al cambiar filtro
[ ] searchParams leído en la página y pasado al wrapper
[ ] Botón "Limpiar filtros" visible si hay algún filtro activo
[ ] Probado: cambiar filtro → URL cambia → datos se actualizan → Back funciona
```