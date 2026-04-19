# SKILL: React Query v5

> Stack: @tanstack/react-query v5 + Next.js 14 App Router + Axios

---

## Setup

```tsx
// /app/layout.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:        60 * 1000,   // 1 minuto antes de refetch
        retry:            1,            // reintentar 1 vez antes de error
        refetchOnWindowFocus: false,    // no refetch al cambiar de pestaña
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## useQuery — leer datos

```typescript
// /features/proyectos/hooks.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProyectos, getProyecto } from "@/services/proyectos";
import { FiltrosProyecto } from "@/services/proyectos";

// Query keys centralizados — OBLIGATORIO, nunca strings sueltos
export const proyectosKeys = {
  all:    ["proyectos"] as const,
  list:   (f: FiltrosProyecto) => ["proyectos", "list", f] as const,
  detail: (id: string)         => ["proyectos", "detail", id] as const,
};

// Hook de lista (con filtros)
export function useProyectos(filtros: FiltrosProyecto = {}) {
  return useQuery({
    queryKey: proyectosKeys.list(filtros),
    queryFn:  () => getProyectos(filtros),
  });
}

// Hook de detalle
export function useProyecto(id: string) {
  return useQuery({
    queryKey: proyectosKeys.detail(id),
    queryFn:  () => getProyecto(id),
    enabled:  !!id,    // no ejecutar si id está vacío
  });
}
```

### Usar en un componente

```tsx
"use client";
import { useProyectos } from "./hooks";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { EmptyState }   from "@/components/ui/EmptyState";

export function ListadoProyectos({ filtros }) {
  const { data, isLoading, isError } = useProyectos(filtros);

  // Siempre los 3 estados — nunca saltarse ninguno
  if (isLoading) return <div className="space-y-4">{Array.from({length:3}).map((_,i)=><SkeletonCard key={i}/>)}</div>;
  if (isError)   return <EmptyState icono="⚠️" titulo="Error al cargar" />;
  if (!data?.items?.length) return <EmptyState icono="🔍" titulo="Sin resultados" />;

  return (
    <div className="space-y-4">
      {data.items.map((p) => <ProyectoCard key={p.id} proyecto={p} />)}
    </div>
  );
}
```

---

## useMutation — crear / editar / eliminar

```typescript
// /features/admin/proyectos/hooks.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { proyectosKeys } from "@/features/proyectos/hooks";

// Mutación para cambiar estado
export function useCambiarEstado(proyectoId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: { estado_nuevo: string; motivo: string }) =>
      api.patch(`/proyectos/${proyectoId}/estado`, body).then(r => r.data),

    onSuccess: () => {
      // Invalidar el detalle para que se recargue
      qc.invalidateQueries({ queryKey: proyectosKeys.detail(proyectoId) });
      // También invalidar la lista por si aparece el estado ahí
      qc.invalidateQueries({ queryKey: proyectosKeys.all });
    },
  });
}

// Mutación para crear
export function useCrearProyecto() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: ProyectoCreate) =>
      api.post("/proyectos", body).then(r => r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: proyectosKeys.all });
    },
  });
}
```

### Usar mutación en un componente

```tsx
"use client";
import { useCambiarEstado } from "./hooks";
import { useToast } from "@/components/ui/use-toast";

export function BotonCambiarEstado({ proyectoId }: { proyectoId: string }) {
  const { toast } = useToast();
  const { mutate, isPending } = useCambiarEstado(proyectoId);

  const handleSubmit = (datos: { estado_nuevo: string; motivo: string }) => {
    mutate(datos, {
      onSuccess: () => toast({ title: "Estado actualizado" }),
      onError:   () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  return (
    <button
      onClick={() => handleSubmit({ estado_nuevo: "en_debate", motivo: "Aprobado por comisión" })}
      disabled={isPending}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
    >
      {isPending ? "Guardando..." : "Cambiar estado"}
    </button>
  );
}
```

---

## Seguimiento (seguir / dejar de seguir)

```typescript
// /features/proyectos/hooks.ts — agregar
export function useSeguirProyecto(proyectoId: string) {
  const qc = useQueryClient();

  const seguir = useMutation({
    mutationFn: () => api.post(`/seguimiento/proyectos/${proyectoId}`).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: proyectosKeys.detail(proyectoId) }),
  });

  const dejarSeguir = useMutation({
    mutationFn: () => api.delete(`/seguimiento/proyectos/${proyectoId}`).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: proyectosKeys.detail(proyectoId) }),
  });

  return { seguir, dejarSeguir };
}
```

---

## Invalidación de caché — cuándo y cómo

```typescript
const qc = useQueryClient();

// Invalidar todo lo de proyectos
qc.invalidateQueries({ queryKey: proyectosKeys.all });

// Invalidar solo el detalle de un proyecto
qc.invalidateQueries({ queryKey: proyectosKeys.detail(id) });

// Invalidar solo las listas (no los detalles)
qc.invalidateQueries({ queryKey: ["proyectos", "list"] });

// Actualizar caché directamente sin refetch (optimistic update)
qc.setQueryData(proyectosKeys.detail(id), (old) => ({
  ...old,
  estado: nuevoEstado,
}));
```

**Regla:** después de toda mutación que modifique datos, invalidar el queryKey correspondiente.
Si la mutación crea un item nuevo → invalidar la lista (`all`).
Si la mutación edita un item → invalidar el detalle (`detail(id)`).
Si afecta ambos → invalidar ambos.

---

## Filtros en query keys

Los filtros forman parte del query key: React Query hace un nuevo fetch
automáticamente cuando cambian.

```typescript
// Si el usuario cambia estado=en_debate → nuevo fetch automático
queryKey: proyectosKeys.list({ estado: "en_debate", page: 1 })
queryKey: proyectosKeys.list({ estado: "aprobado",  page: 1 })
// ↑ Estos son dos entradas distintas en el caché
```

Nunca poner filtros dentro de la `queryFn` sin incluirlos en el `queryKey`.
Si están solo en la función, React Query no sabe cuándo el resultado cambió.

---

## Paginación

```typescript
// El hook recibe page como parte de los filtros
export function useProyectos(filtros: FiltrosProyecto = {}) {
  return useQuery({
    queryKey: proyectosKeys.list(filtros),
    queryFn:  () => getProyectos(filtros),
    placeholderData: (prev) => prev,   // mantiene datos anteriores mientras carga la nueva página
  });
}
```

```tsx
// Componente de paginación — leer/escribir en URL
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function Paginacion({ totalPages, paginaActual }: { totalPages: number; paginaActual: number }) {
  const router = useRouter();
  const params = useSearchParams();

  const irA = (page: number) => {
    const p = new URLSearchParams(params.toString());
    p.set("page", String(page));
    router.push(`?${p.toString()}`);
  };

  return (
    <div className="flex gap-2 justify-center mt-6">
      <button onClick={() => irA(paginaActual - 1)} disabled={paginaActual <= 1}
        className="border rounded-lg px-4 py-2 text-sm disabled:opacity-40 hover:bg-gray-50">
        ← Anterior
      </button>
      <span className="px-4 py-2 text-sm text-gray-500">
        {paginaActual} / {totalPages}
      </span>
      <button onClick={() => irA(paginaActual + 1)} disabled={paginaActual >= totalPages}
        className="border rounded-lg px-4 py-2 text-sm disabled:opacity-40 hover:bg-gray-50">
        Siguiente →
      </button>
    </div>
  );
}
```

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Datos no se actualizan tras mutación | Falta `invalidateQueries` en `onSuccess` | Agregar invalidación al hook de mutación |
| Fetch repetido en cada render | `queryClient` recreado en cada render | Crear con `useState(() => new QueryClient())` |
| `isLoading` nunca pasa a `false` | `enabled: false` accidental | Verificar condición `enabled` |
| Filtros ignorados en caché | Filtros no están en `queryKey` | Siempre incluir filtros en el key |
| `useQuery` fuera de Provider | Componente no envuelto en `QueryClientProvider` | Mover Provider a `layout.tsx` raíz |
| `isPending` vs `isLoading` | En v5, `isLoading` solo aplica a la primera carga; `isPending` es para mutaciones | Usar `isLoading` en queries, `isPending` en mutaciones |
