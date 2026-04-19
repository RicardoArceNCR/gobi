# TAREA: Crear un componente React

> Sigue estos pasos en orden para cada componente nuevo.

---

## Decidir dónde va el componente

```
/components/ui/         → componente genérico reutilizable (sin lógica de negocio)
                          Ejemplos: BadgeEstado, MetricaCard, EmptyState, SkeletonCard

/components/layout/     → estructura de la página
                          Ejemplos: Navbar, Sidebar, AppLayout

/features/{modulo}/     → componente específico de un módulo con lógica
                          Ejemplos: ProyectoCard, FiltrosProyecto, BotonSeguir

/features/admin/{mod}/  → componentes solo para el panel admin
                          Ejemplos: FormularioProyecto, PanelCambioEstado
```

---

## Paso 1 — ¿Necesita datos del servidor?

### Sí → crear hook primero

```typescript
// /features/{modulo}/hooks.ts
import { useQuery } from "@tanstack/react-query";
import { getMiEntidad } from "@/services/{modulo}";

export const miEntidadKeys = {
  all:    ["mi-entidad"] as const,
  list:   (f: any) => ["mi-entidad", "list", f] as const,
  detail: (id: string) => ["mi-entidad", "detail", id] as const,
};

export function useMiEntidad(id: string) {
  return useQuery({
    queryKey: miEntidadKeys.detail(id),
    queryFn:  () => getMiEntidad(id),
    enabled:  !!id,
  });
}
```

```typescript
// /services/{modulo}.ts
import { api } from "./api";

export async function getMiEntidad(id: string) {
  const { data } = await api.get(`/mi-entidad/${id}`);
  return data;
}
```

### No → ir directo al componente con props

---

## Paso 2 — Estructura del componente

### Componente UI (sin datos)

```tsx
// /components/ui/MiComponente.tsx
import { cn } from "@/lib/utils";

interface Props {
  valor:      string;
  label:      string;
  className?: string;        // siempre permitir clase adicional
}

export function MiComponente({ valor, label, className }: Props) {
  return (
    <div className={cn("border rounded-xl p-4 bg-white", className)}>
      <p className="text-2xl font-bold text-gray-900">{valor}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
```

### Componente con datos del servidor

```tsx
// /features/{modulo}/MiComponente.tsx
"use client";   // OBLIGATORIO si usa hooks

import { useMiEntidad } from "./hooks";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  id: string;
}

export function MiComponente({ id }: Props) {
  const { data, isLoading, isError, error } = useMiEntidad(id);

  // 1. Loading
  if (isLoading) return <SkeletonCard />;

  // 2. Error
  if (isError) return (
    <EmptyState icono="⚠️" titulo="Error al cargar"
      descripcion={(error as Error)?.message} />
  );

  // 3. Vacío
  if (!data) return (
    <EmptyState icono="📭" titulo="No encontrado" />
  );

  // 4. Éxito
  return (
    <div className="border rounded-xl p-4 bg-white">
      <h3 className="font-semibold text-gray-900">{data.titulo}</h3>
      <p className="text-sm text-gray-500">{data.descripcion}</p>
    </div>
  );
}
```

### Componente con mutación

```tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { miEntidadKeys } from "./hooks";

export function BotonAccion({ entidadId }: { entidadId: string }) {
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post(`/mi-entidad/${entidadId}/accion`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: miEntidadKeys.detail(entidadId) });
    },
  });

  return (
    <button
      onClick={() => mutate()}
      disabled={isPending}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
    >
      {isPending ? "Procesando..." : "Ejecutar acción"}
    </button>
  );
}
```

---

## Paso 3 — Usar en una página

```tsx
// /app/{ruta}/page.tsx
import { MiComponente } from "@/features/{modulo}/MiComponente";

export default function MiPagina({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <MiComponente id={params.id} />
    </div>
  );
}
```

---

## Reglas de estilo para componentes

```tsx
// Cards — siempre igual
className="border rounded-xl p-4 bg-white hover:shadow-md transition"

// Títulos
className="font-semibold text-gray-900"          // sección
className="text-2xl font-bold text-gray-900"     // página

// Texto secundario
className="text-sm text-gray-500"
className="text-xs text-gray-400"                // caption, fechas

// Botón primario
className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium
           hover:bg-blue-700 transition disabled:opacity-50"

// Botón secundario (outline)
className="border border-blue-500 text-blue-600 px-4 py-2 rounded-lg text-sm
           font-medium hover:bg-blue-50 transition"
```

---

## Checklist

```
[ ] Ubicación correcta: /components/ui/, /features/{modulo}/, /features/admin/
[ ] "use client" si usa useState, hooks de React Query o Clerk
[ ] Props tipadas con interface
[ ] Si hay datos: 3 estados (loading → skeleton, error → EmptyState, vacío → EmptyState)
[ ] Hook en /features/{modulo}/hooks.ts si necesita datos
[ ] Servicio en /services/{modulo}.ts si llama API
[ ] Query key centralizado en hooks.ts
[ ] Estilos consistentes con los tokens del proyecto
[ ] className prop opcional para flexibilidad
[ ] Componente < 200 líneas — dividir si es más largo
```
