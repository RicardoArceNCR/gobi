# GOBi — Fase 3: Consumo de API (Frontend → Backend)

> **Objetivo:** Conectar el frontend a FastAPI real. Reemplazar mock data con datos reales, manejar los tres estados de toda petición, filtros en URL.

> **Prerequisito:** Fase 2 completada — backend corriendo en localhost:8000.

---

## Contexto para tu editor de IA

```
Proyecto: GOBi — plataforma cívica costarricense
Stack: Next.js 14 App Router + TypeScript + React Query v5 + Axios
Backend: FastAPI en NEXT_PUBLIC_API_URL (default: http://localhost:8000)
Fase: 3 — reemplazar mock data por API real
Regla: nunca llamar la API directo desde un componente. Siempre: componente → hook → servicio → API
```

---

## Instalación

```bash
npm install @tanstack/react-query axios
npm install @tanstack/react-query-devtools --save-dev
```

---

## Setup React Query

```tsx
// /app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,   // 5 min antes de refetch
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```tsx
// /app/layout.tsx — agregar Providers
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## Capa de servicios

```typescript
// /services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Interceptor para agregar token de Clerk en requests autenticados.
// Se configura en Fase 5 con TokenProvider.
// Aquí se define la función — en GOBi_05 se llama automáticamente con getToken de Clerk.
export function configurarToken(getToken: () => Promise<string | null>) {
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}
```

```typescript
// /services/proyectos.ts
import { api } from "./api";
import { ProyectoLey, EstadoProyecto } from "@/types";

export interface FiltrosProyecto {
  estado?: EstadoProyecto | "";
  tema?: string;
  partido?: string;
  busqueda?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedProyectos {
  items: ProyectoLey[];
  total: number;
  page: number;
  total_pages: number;
}

export async function getProyectos(filtros: FiltrosProyecto = {}): Promise<PaginatedProyectos> {
  // Limpiar parámetros vacíos antes de enviar
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, v]) => v !== "" && v !== undefined)
  );
  const { data } = await api.get("/proyectos", { params });
  return data;
}

export async function getProyecto(id: string): Promise<ProyectoLey> {
  const { data } = await api.get(`/proyectos/${id}`);
  return data;
}

export async function crearProyecto(body: unknown) {
  const { data } = await api.post("/proyectos", body);
  return data;
}

export async function actualizarProyecto(id: string, body: unknown) {
  const { data } = await api.patch(`/proyectos/${id}`, body);
  return data;
}

export async function cambiarEstado(id: string, estado_nuevo: string, motivo: string) {
  const { data } = await api.patch(`/proyectos/${id}/estado`, { estado_nuevo, motivo });
  return data;
}
```

```typescript
// /services/diputados.ts
import { api } from "./api";

export async function getDiputados(params = {}) {
  const { data } = await api.get("/diputados", { params });
  return data;
}

export async function getDiputado(id: string) {
  const { data } = await api.get(`/diputados/${id}`);
  return data;
}
```

---

## Hooks

```typescript
// /features/proyectos/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProyectos, getProyecto, crearProyecto,
  actualizarProyecto, cambiarEstado, FiltrosProyecto
} from "@/services/proyectos";

// Query keys centralizados — evita errores de invalidación
export const proyectosKeys = {
  all: ["proyectos"] as const,
  list: (filtros: FiltrosProyecto) => ["proyectos", "list", filtros] as const,
  detail: (id: string) => ["proyectos", "detail", id] as const,
};

export function useProyectos(filtros: FiltrosProyecto = {}) {
  return useQuery({
    queryKey: proyectosKeys.list(filtros),
    queryFn: () => getProyectos(filtros),
  });
}

export function useProyecto(id: string) {
  return useQuery({
    queryKey: proyectosKeys.detail(id),
    queryFn: () => getProyecto(id),
    enabled: !!id,
  });
}

export function useCambiarEstado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado, motivo }: { id: string; estado: string; motivo: string }) =>
      cambiarEstado(id, estado, motivo),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: proyectosKeys.detail(id) });
      qc.invalidateQueries({ queryKey: proyectosKeys.all });
    },
  });
}
```

```typescript
// /features/diputados/hooks.ts
import { useQuery } from "@tanstack/react-query";
import { getDiputados, getDiputado } from "@/services/diputados";

export function useDiputados(params = {}) {
  return useQuery({
    queryKey: ["diputados", params],
    queryFn: () => getDiputados(params),
  });
}

export function useDiputado(id: string) {
  return useQuery({
    queryKey: ["diputados", id],
    queryFn: () => getDiputado(id),
    enabled: !!id,
  });
}
```

---

## Patrón de componente con los tres estados

```tsx
// /features/proyectos/ListadoProyectos.tsx
"use client";

import { useProyectos } from "./hooks";
import { ProyectoCard } from "./ProyectoCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FiltrosProyecto } from "@/services/proyectos";

export function ListadoProyectos({ filtros }: { filtros: FiltrosProyecto }) {
  const { data, isLoading, isError, error } = useProyectos(filtros);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        titulo="Error al cargar proyectos"
        descripcion={(error as Error)?.message || "Intenta de nuevo en un momento."}
        icono="⚠️"
      />
    );
  }

  if (!data?.items?.length) {
    return (
      <EmptyState
        titulo="Sin resultados"
        descripcion="No hay proyectos que coincidan con los filtros."
        icono="🔍"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {data.items.map((p) => <ProyectoCard key={p.id} proyecto={p} />)}
    </div>
  );
}
```

```tsx
// /components/ui/SkeletonCard.tsx
export function SkeletonCard() {
  return (
    <div className="border rounded-xl p-4 animate-pulse bg-white">
      <div className="flex justify-between mb-3">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-200 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 rounded mb-1" />
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-3" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}
```

---

## Página de proyectos conectada a API

```tsx
// /app/proyectos/page.tsx
import { Suspense } from "react";
import { FiltrosProyecto } from "@/features/proyectos/FiltrosProyecto";
import { ListadoProyectos } from "@/features/proyectos/ListadoProyectos";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

interface Props {
  searchParams: {
    estado?: string;
    tema?: string;
    partido?: string;
    busqueda?: string;
    page?: string;
  };
}

export default function ProyectosPage({ searchParams }: Props) {
  const filtros = {
    estado: searchParams.estado as any,
    tema: searchParams.tema,
    partido: searchParams.partido,
    busqueda: searchParams.busqueda,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Proyectos de ley</h1>
      <div className="mb-6">
        <FiltrosProyecto />
      </div>
      <Suspense fallback={
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      }>
        <ListadoProyectos filtros={filtros} />
      </Suspense>
    </div>
  );
}
```

> **Nota:** `ListadoProyectos` ya tiene `"use client"` porque usa hooks. La página de proyectos puede importarlo directamente — Next.js maneja la frontera server/client automáticamente cuando un Server Component importa un Client Component.

---

## Paginación

```tsx
// /components/ui/Paginacion.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  page: number;
  totalPages: number;
}

export function Paginacion({ page, totalPages }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const ir = (nuevaPagina: number) => {
    const p = new URLSearchParams(params.toString());
    p.set("page", String(nuevaPagina));
    router.push(`?${p.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2 justify-center mt-8">
      <button
        onClick={() => ir(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition"
      >
        Anterior
      </button>
      <span className="text-sm text-gray-500 px-2">
        Página {page} de {totalPages}
      </span>
      <button
        onClick={() => ir(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition"
      >
        Siguiente
      </button>
    </div>
  );
}
```

---

## Detalle de proyecto (conectado)

```tsx
// /app/proyectos/[id]/page.tsx
import type { Metadata } from "next";
import { ProyectoDetalleClient } from "@/features/proyectos/ProyectoDetalleClient";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/proyectos/${params.id}`,
      { next: { revalidate: 300 } }
    );
    const proyecto = await res.json();
    return {
      title: `${proyecto.titulo} | GOBi`,
      description: proyecto.descripcion?.slice(0, 160),
    };
  } catch {
    return { title: "Proyecto | GOBi" };
  }
}

export default function ProyectoPage({ params }: { params: { id: string } }) {
  return <ProyectoDetalleClient id={params.id} />;
}
```

```tsx
// /features/proyectos/ProyectoDetalleClient.tsx
"use client";

import { useProyecto } from "./hooks";
import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { TimelineLegislativa } from "@/components/ui/TimelineLegislativa";
import { TablaVotos } from "@/components/ui/TablaVotos";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { formatearFecha } from "@/lib/utils";
import Link from "next/link";

export function ProyectoDetalleClient({ id }: { id: string }) {
  const { data: proyecto, isLoading, isError } = useProyecto(id);

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (isError || !proyecto) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
      <p className="text-4xl mb-4">⚠️</p>
      <p>No se pudo cargar el proyecto.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Cabecera */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-mono text-gray-400">Exp. #{proyecto.codigo}</span>
          <BadgeEstado estado={proyecto.estado} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{proyecto.titulo}</h1>
        <p className="text-gray-600 leading-relaxed">{proyecto.descripcion}</p>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-400 mb-1">Proponente</p>
          <Link href={`/diputados/${proyecto.proponente.id}`} className="font-medium text-blue-700 hover:underline">
            {proyecto.proponente.nombre}
          </Link>
          <p className="text-gray-500">{proyecto.proponente.partido.nombre}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-400 mb-1">Comisión</p>
          <p className="font-medium">{proyecto.comision_nombre || "Sin asignar"}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-400 mb-1">Presentado</p>
          <p className="font-medium">{formatearFecha(proyecto.fecha_presentacion)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-400 mb-1">Último cambio</p>
          <p className="font-medium">{formatearFecha(proyecto.fecha_ultimo_cambio)}</p>
        </div>
      </div>

      {/* Temas */}
      {proyecto.temas.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {proyecto.temas.map((t) => (
            <span
              key={t.id}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: t.color_hex + "20", color: t.color_hex }}
            >
              {t.nombre}
            </span>
          ))}
        </div>
      )}

      {/* Timeline */}
      {proyecto.historial.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-4">Historial</h2>
          <TimelineLegislativa historial={proyecto.historial} />
        </section>
      )}

      {/* Votos */}
      {proyecto.votos.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-4">Votación</h2>
          <TablaVotos votos={proyecto.votos} />
        </section>
      )}

      {/* Documentos */}
      {proyecto.documentos.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-4">Documentos</h2>
          <div className="space-y-2">
            {proyecto.documentos.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 transition"
              >
                <span className="text-red-500">📄</span>
                <span className="text-sm font-medium text-gray-800">{doc.nombre}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## Entregable de Fase 3

- [ ] React Query configurado con Providers en layout
- [ ] Capa `/services/` con funciones para proyectos, diputados, comisiones
- [ ] Query keys centralizados en cada feature
- [ ] Hook `useProyectos`, `useProyecto`, `useDiputados`, `useDiputado`
- [ ] Todos los componentes manejan loading (skeleton), error y empty
- [ ] Filtros en URL y conectados a API (query params reales)
- [ ] Paginación funcional con URL
- [ ] Detalle de proyecto completo: timeline, votos, documentos, links relacionados
- [ ] Metadata SEO en detalle de proyecto
- [ ] Mock data eliminado de todas las páginas

---

## Prompts para tu editor de IA

```
Proyecto: GOBi — plataforma cívica costarricense
Stack: Next.js 14 App Router, TypeScript, Tailwind, React Query v5, Axios
Backend: FastAPI en NEXT_PUBLIC_API_URL
Fase: 3 — consumo de API real

Arquitectura de datos:
- Llamadas API en /services/{entidad}.ts
- Hooks en /features/{entidad}/hooks.ts usando useQuery/useMutation
- Componentes consumen hooks, nunca llaman API directamente
- Query keys en proyectosKeys / diputadosKeys para invalidación correcta

Tarea: [describe lo que construyes]

Reglas:
- Siempre tres estados: isLoading → skeleton, isError → EmptyState con ⚠️, vacío → EmptyState
- Filtros siempre en URL como query params (useSearchParams + router.push)
- Paginación con query param ?page=N
- Invalidar queryKey correcto después de mutaciones
```

Siguiente: GOBi_04_fase-diseno-ux.md
