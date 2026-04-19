# GOBi — Fase 1: Frontend Base (sin backend)

> **Objetivo:** Dominar la interfaz antes de tocar el backend. Datos mock, componentes reales.

> **Regla de oro:** NO conectar APIs todavía. Primero domina la composición de UI.

---

## Contexto para tu editor de IA

```
Proyecto: GOBi — plataforma de inteligencia política costarricense
Stack: Next.js 14 App Router + TypeScript + Tailwind CSS
Fase: 1 — Solo frontend, datos mock, sin backend
Regla: NO conectar APIs todavía. Primero domina la composición de UI.
```

---

## Setup inicial

```bash
npx create-next-app@latest gobi --typescript --tailwind --app --src-dir=false
cd gobi
npm install lucide-react clsx
npx shadcn-ui@latest init
npx shadcn-ui@latest add badge button card separator skeleton
```

---

## Estructura de carpetas

```
/app
  layout.tsx
  page.tsx                        ← Home (feed)
  /proyectos
    page.tsx                      ← Listado
    /[id]/page.tsx                ← Detalle
  /diputados
    page.tsx
    /[id]/page.tsx
  /comisiones
    page.tsx
    /[id]/page.tsx

/components
  /layout
    Navbar.tsx
    Sidebar.tsx
    AppLayout.tsx
  /ui
    BadgeEstado.tsx
    BadgePrioridad.tsx
    SkeletonCard.tsx               ← definido en esta fase
    TimelineLegislativa.tsx
    TablaVotos.tsx
    EmptyState.tsx

/features
  /proyectos
    ProyectoCard.tsx
    ProyectoDetalle.tsx
    FiltrosProyecto.tsx
    ListadoProyectos.tsx
  /diputados
    DiputadoCard.tsx
    DiputadoDetalle.tsx
  /comisiones
    ComisionCard.tsx
  /feed
    FeedItem.tsx

/data
  /mock
    proyectos.ts
    diputados.ts
    comisiones.ts
    comunicados.ts
    temas.ts

/types
  index.ts

/lib
  utils.ts
```

---

## Tipos TypeScript completos

```typescript
// /types/index.ts

export type EstadoProyecto =
  | "presentado"
  | "en_comision"
  | "en_debate"
  | "votado"
  | "aprobado"
  | "archivado";

export type PrioridadFeed = "urgente" | "en_debate" | "actualizado" | "seguido";

export type RolUsuario = "ciudadano" | "diputado" | "admin";

export type ValorVoto = "a_favor" | "en_contra" | "abstencion" | "ausente";

export interface Tema {
  id: string;
  nombre: string;
  slug: string;
  colorHex: string;
}

export interface Partido {
  id: string;
  nombre: string;
  colorHex: string;
  logoUrl?: string;
}

export interface Diputado {
  id: string;
  nombre: string;
  fotoUrl?: string;
  partidoId: string;
  partido: Partido;
  comisionIds: string[];
  salario: number;
  montoGasolina: number;
  fechaInicio: string;
}

export interface CambioEstado {
  id: string;
  estadoAnterior: EstadoProyecto;
  estadoNuevo: EstadoProyecto;
  motivo: string;
  fecha: string;
  usuarioNombre: string;
}

export interface Documento {
  id: string;
  nombre: string;
  url: string;
  tipo: "pdf" | "audio" | "video";
  fechaSubida: string;
}

export interface Voto {
  diputadoId: string;
  diputadoNombre: string;
  partido: string;
  valor: ValorVoto;
}

export interface ProyectoLey {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  textoCompleto?: string;   // camelCase en frontend (snake_case en backend)
  estado: EstadoProyecto;
  fechaPresentacion: string;
  fechaUltimoCambio: string;
  proponente: Diputado;
  comisionId: string;
  comisionNombre: string;
  temas: Tema[];
  historial: CambioEstado[];
  documentos: Documento[];
  votos: Voto[];
  prioridad?: PrioridadFeed;
}

export interface Comunicado {
  id: string;
  titulo: string;
  contenido: string;
  fuente: string;
  fecha: string;
  proyectoId?: string;
  proyectoTitulo?: string;
  diputadoId?: string;
  diputadoNombre?: string;
  comisionId?: string;
  comisionNombre?: string;
  prioridad: PrioridadFeed;
}

export interface Comision {
  id: string;
  nombre: string;
  descripcion: string;
  miembros: Diputado[];
  proyectosActivos: number;
}
```

---

## Datos mock

```typescript
// /data/mock/temas.ts
import { Tema } from "@/types";

export const temasMock: Tema[] = [
  { id: "1", nombre: "Educación",     slug: "educacion",     colorHex: "#3b82f6" },
  { id: "2", nombre: "Salud",         slug: "salud",         colorHex: "#10b981" },
  { id: "3", nombre: "Transparencia", slug: "transparencia", colorHex: "#8b5cf6" },
  { id: "4", nombre: "Economía",      slug: "economia",      colorHex: "#f59e0b" },
  { id: "5", nombre: "Seguridad",     slug: "seguridad",     colorHex: "#ef4444" },
  { id: "6", nombre: "Ambiente",      slug: "ambiente",      colorHex: "#22c55e" },
];
```

```typescript
// /data/mock/diputados.ts
import { Diputado } from "@/types";

export const diputadosMock: Diputado[] = [
  {
    id: "dip-001",
    nombre: "María Fernández Mora",
    partidoId: "p-001",
    partido: { id: "p-001", nombre: "PLN", colorHex: "#16a34a" },
    comisionIds: ["com-001"],
    salario: 4200000,
    montoGasolina: 320000,
    fechaInicio: "2022-05-08",
  },
  {
    id: "dip-002",
    nombre: "Carlos Rodríguez Vargas",
    partidoId: "p-002",
    partido: { id: "p-002", nombre: "PUSC", colorHex: "#1d4ed8" },
    comisionIds: ["com-002"],
    salario: 4200000,
    montoGasolina: 285000,
    fechaInicio: "2022-05-08",
  },
  {
    id: "dip-003",
    nombre: "Ana Villalobos Jiménez",
    partidoId: "p-003",
    partido: { id: "p-003", nombre: "FA", colorHex: "#dc2626" },
    comisionIds: ["com-001", "com-003"],
    salario: 4200000,
    montoGasolina: 310000,
    fechaInicio: "2022-05-08",
  },
];
```

```typescript
// /data/mock/proyectos.ts
import { ProyectoLey } from "@/types";
import { temasMock } from "./temas";
import { diputadosMock } from "./diputados";

export const proyectosMock: ProyectoLey[] = [
  {
    id: "1",
    codigo: "24193",
    titulo: "Ley de Transparencia en Contratación Pública",
    descripcion: "Establece mecanismos de control ciudadano en licitaciones del estado.",
    estado: "en_debate",
    prioridad: "urgente",
    fechaPresentacion: "2024-03-15",
    fechaUltimoCambio: "2024-04-10",
    proponente: diputadosMock[0],
    comisionId: "com-001",
    comisionNombre: "Comisión de Gobierno y Administración",
    temas: [temasMock[2], temasMock[3]],
    historial: [
      { id: "h1", estadoAnterior: "presentado", estadoNuevo: "en_comision", motivo: "Asignado por Mesa Directiva", fecha: "2024-03-20", usuarioNombre: "Sistema" },
      { id: "h2", estadoAnterior: "en_comision", estadoNuevo: "en_debate", motivo: "Aprobado con modificaciones menores", fecha: "2024-04-08", usuarioNombre: "Admin GOBi" },
    ],
    documentos: [
      { id: "d1", nombre: "Texto del proyecto.pdf", url: "#", tipo: "pdf", fechaSubida: "2024-03-15" },
    ],
    votos: [],
  },
  {
    id: "2",
    codigo: "24210",
    titulo: "Reforma a la Ley de Becas Universitarias",
    descripcion: "Modifica criterios de acceso al fondo nacional de becas.",
    estado: "en_comision",
    prioridad: "en_debate",
    fechaPresentacion: "2024-04-02",
    fechaUltimoCambio: "2024-04-15",
    proponente: diputadosMock[1],
    comisionId: "com-002",
    comisionNombre: "Comisión de Educación",
    temas: [temasMock[0]],
    historial: [
      { id: "h3", estadoAnterior: "presentado", estadoNuevo: "en_comision", motivo: "Asignado a Comisión de Educación", fecha: "2024-04-05", usuarioNombre: "Sistema" },
    ],
    documentos: [],
    votos: [],
  },
  {
    id: "3",
    codigo: "24087",
    titulo: "Ley de Presupuesto Participativo Municipal",
    descripcion: "Obliga a municipalidades con más de 50.000 habitantes a destinar un 10% del presupuesto a proyectos ciudadanos.",
    estado: "aprobado",
    prioridad: "actualizado",
    fechaPresentacion: "2023-11-10",
    fechaUltimoCambio: "2024-04-01",
    proponente: diputadosMock[2],
    comisionId: "com-001",
    comisionNombre: "Comisión de Gobierno y Administración",
    temas: [temasMock[2], temasMock[3]],
    historial: [
      { id: "h4", estadoAnterior: "presentado",  estadoNuevo: "en_comision", motivo: "Asignado a comisión",          fecha: "2023-11-15", usuarioNombre: "Sistema"    },
      { id: "h5", estadoAnterior: "en_comision", estadoNuevo: "en_debate",   motivo: "Dictamen positivo",            fecha: "2024-01-20", usuarioNombre: "Admin GOBi" },
      { id: "h6", estadoAnterior: "en_debate",   estadoNuevo: "votado",      motivo: "Primera votación realizada",  fecha: "2024-03-15", usuarioNombre: "Admin GOBi" },
      { id: "h7", estadoAnterior: "votado",       estadoNuevo: "aprobado",    motivo: "Aprobado en segundo debate 45-10", fecha: "2024-04-01", usuarioNombre: "Admin GOBi" },
    ],
    documentos: [],
    votos: [
      { diputadoId: "dip-001", diputadoNombre: "María Fernández Mora",    partido: "PLN",  valor: "a_favor"  },
      { diputadoId: "dip-002", diputadoNombre: "Carlos Rodríguez Vargas", partido: "PUSC", valor: "en_contra" },
      { diputadoId: "dip-003", diputadoNombre: "Ana Villalobos Jiménez",  partido: "FA",   valor: "a_favor"  },
    ],
  },
];
```

```typescript
// /data/mock/comunicados.ts
import { Comunicado } from "@/types";

export const comunicadosMock: Comunicado[] = [
  {
    id: "c1",
    titulo: "Proyecto de transparencia pasa a debate en plenario",
    contenido: "La Asamblea Legislativa inició esta semana el debate del expediente 24193 sobre transparencia en contratación pública.",
    fuente: "Asamblea Legislativa",
    fecha: "2024-04-10",
    proyectoId: "1",
    proyectoTitulo: "Ley de Transparencia en Contratación Pública",
    diputadoId: "dip-001",
    diputadoNombre: "María Fernández Mora",
    prioridad: "urgente",
  },
  {
    id: "c2",
    titulo: "Reforma a Ley de Becas asignada a Comisión de Educación",
    contenido: "El expediente 24210 fue asignado formalmente a la Comisión de Educación para su análisis.",
    fuente: "Mesa Directiva",
    fecha: "2024-04-05",
    proyectoId: "2",
    proyectoTitulo: "Reforma a la Ley de Becas Universitarias",
    prioridad: "en_debate",
  },
];
```

```typescript
// /data/mock/comisiones.ts
import { Comision } from "@/types";
import { diputadosMock } from "./diputados";

export const comisionesMock: Comision[] = [
  {
    id: "com-001",
    nombre: "Comisión de Gobierno y Administración",
    descripcion: "Analiza proyectos relacionados con la organización y funcionamiento del Estado.",
    miembros: [diputadosMock[0], diputadosMock[2]],
    proyectosActivos: 2,
  },
  {
    id: "com-002",
    nombre: "Comisión de Educación",
    descripcion: "Dictamina sobre proyectos de educación en todos sus niveles.",
    miembros: [diputadosMock[1]],
    proyectosActivos: 1,
  },
];
```

---

## Utilidades y componentes UI base

```typescript
// /lib/utils.ts
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-CR", {
    day: "numeric", month: "long", year: "numeric"
  });
}

export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat("es-CR", {
    style: "currency", currency: "CRC", minimumFractionDigits: 0
  }).format(monto);
}
```

```tsx
// /components/ui/BadgeEstado.tsx
import { cn } from "@/lib/utils";
import { EstadoProyecto } from "@/types";

const config: Record<EstadoProyecto, { clase: string; etiqueta: string }> = {
  presentado:  { clase: "bg-gray-100 text-gray-700",    etiqueta: "Presentado"  },
  en_comision: { clase: "bg-yellow-100 text-yellow-800", etiqueta: "En comisión" },
  en_debate:   { clase: "bg-blue-100 text-blue-800",     etiqueta: "En debate"   },
  votado:      { clase: "bg-purple-100 text-purple-800", etiqueta: "Votado"      },
  aprobado:    { clase: "bg-green-100 text-green-800",   etiqueta: "Aprobado"    },
  archivado:   { clase: "bg-red-100 text-red-800",       etiqueta: "Archivado"   },
};

export function BadgeEstado({ estado, className }: { estado: EstadoProyecto; className?: string }) {
  const { clase, etiqueta } = config[estado];
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", clase, className)}>
      {etiqueta}
    </span>
  );
}
```

```tsx
// /components/ui/BadgePrioridad.tsx
import { PrioridadFeed } from "@/types";
import { cn } from "@/lib/utils";

const config: Record<PrioridadFeed, { clase: string; dot: string; etiqueta: string }> = {
  urgente:     { clase: "bg-red-50 text-red-700 border border-red-200",      dot: "bg-red-500",    etiqueta: "Urgente"      },
  en_debate:   { clase: "bg-blue-50 text-blue-700 border border-blue-200",   dot: "bg-blue-500",   etiqueta: "En debate"    },
  actualizado: { clase: "bg-green-50 text-green-700 border border-green-200", dot: "bg-green-500", etiqueta: "Actualizado"  },
  seguido:     { clase: "bg-gray-50 text-gray-600 border border-gray-200",   dot: "bg-gray-400",   etiqueta: "Seguido"      },
};

export function BadgePrioridad({ prioridad, className }: { prioridad: PrioridadFeed; className?: string }) {
  const { clase, dot, etiqueta } = config[prioridad];
  return (
    <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", clase, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {etiqueta}
    </span>
  );
}
```

```tsx
// /components/ui/EmptyState.tsx
interface Props {
  titulo: string;
  descripcion?: string;
  icono?: string;
}

export function EmptyState({ titulo, descripcion, icono = "📭" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">{icono}</span>
      <h3 className="font-semibold text-gray-900 mb-1">{titulo}</h3>
      {descripcion && <p className="text-sm text-gray-500 max-w-xs">{descripcion}</p>}
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

```tsx
// /components/ui/TimelineLegislativa.tsx
import { CambioEstado } from "@/types";
import { BadgeEstado } from "./BadgeEstado";
import { formatearFecha } from "@/lib/utils";

export function TimelineLegislativa({ historial }: { historial: CambioEstado[] }) {
  if (!historial.length) return null;

  return (
    <div className="relative pl-6 space-y-6">
      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
      {historial.map((entrada) => (
        <div key={entrada.id} className="relative flex gap-4">
          <div className="absolute -left-[18px] w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white mt-1.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <BadgeEstado estado={entrada.estadoNuevo} />
              <span className="text-xs text-gray-400">{formatearFecha(entrada.fecha)}</span>
            </div>
            <p className="text-sm text-gray-600">{entrada.motivo}</p>
            <p className="text-xs text-gray-400 mt-0.5">por {entrada.usuarioNombre}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// /components/ui/TablaVotos.tsx
import { Voto } from "@/types";

const config = {
  a_favor:    { clase: "bg-green-100 text-green-800",   etiqueta: "A favor"    },
  en_contra:  { clase: "bg-red-100 text-red-800",       etiqueta: "En contra"  },
  abstencion: { clase: "bg-yellow-100 text-yellow-800", etiqueta: "Abstención" },
  ausente:    { clase: "bg-gray-100 text-gray-500",     etiqueta: "Ausente"    },
};

export function TablaVotos({ votos }: { votos: Voto[] }) {
  if (!votos.length) return null;

  const resumen = votos.reduce((acc, v) => {
    acc[v.valor] = (acc[v.valor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        {Object.entries(resumen).map(([valor, total]) => (
          <div key={valor} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${config[valor as keyof typeof config].clase}`}>
            {config[valor as keyof typeof config].etiqueta}: {total}
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Diputado/a</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Partido</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Voto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {votos.map((v) => (
              <tr key={v.diputadoId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{v.diputadoNombre}</td>
                <td className="px-4 py-3 text-gray-500">{v.partido}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[v.valor].clase}`}>
                    {config[v.valor].etiqueta}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Features: Proyectos

```tsx
// /features/proyectos/ProyectoCard.tsx
import Link from "next/link";
import { ProyectoLey } from "@/types";
import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { BadgePrioridad } from "@/components/ui/BadgePrioridad";
import { formatearFecha } from "@/lib/utils";

export function ProyectoCard({ proyecto }: { proyecto: ProyectoLey }) {
  return (
    <Link href={`/proyectos/${proyecto.id}`}>
      <div className="border rounded-xl p-4 hover:shadow-md transition bg-white group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs text-gray-400 font-mono">Exp. #{proyecto.codigo}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {proyecto.prioridad && <BadgePrioridad prioridad={proyecto.prioridad} />}
            <BadgeEstado estado={proyecto.estado} />
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition mb-1 line-clamp-2">
          {proyecto.titulo}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{proyecto.descripcion}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {proyecto.temas.slice(0, 3).map((tema) => (
              <span
                key={tema.id}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: tema.colorHex + "20", color: tema.colorHex }}
              >
                {tema.nombre}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatearFecha(proyecto.fechaUltimoCambio)}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

```tsx
// /features/proyectos/FiltrosProyecto.tsx
// NOTA: en Fase 1 los temas vienen de mock. En Fase 3 se reemplaza por useQuery a /temas
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { temasMock } from "@/data/mock/temas";

const ESTADOS = [
  { valor: "", etiqueta: "Todos los estados" },
  { valor: "presentado",  etiqueta: "Presentado"  },
  { valor: "en_comision", etiqueta: "En comisión" },
  { valor: "en_debate",   etiqueta: "En debate"   },
  { valor: "votado",      etiqueta: "Votado"       },
  { valor: "aprobado",    etiqueta: "Aprobado"     },
  { valor: "archivado",   etiqueta: "Archivado"    },
];

export function FiltrosProyecto() {
  const router = useRouter();
  const params = useSearchParams();

  const set = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    p.delete("page");
    router.push(`?${p.toString()}`);
  };

  const hayFiltros = params.get("busqueda") || params.get("estado") || params.get("tema");

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <input
        type="search"
        placeholder="Buscar por título o código..."
        defaultValue={params.get("busqueda") || ""}
        onChange={(e) => set("busqueda", e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={params.get("estado") || ""}
        onChange={(e) => set("estado", e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {ESTADOS.map((e) => (
          <option key={e.valor} value={e.valor}>{e.etiqueta}</option>
        ))}
      </select>
      <select
        value={params.get("tema") || ""}
        onChange={(e) => set("tema", e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los temas</option>
        {temasMock.map((t) => (
          <option key={t.id} value={t.slug}>{t.nombre}</option>
        ))}
      </select>
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

## Páginas

```tsx
// /app/proyectos/page.tsx
import { proyectosMock } from "@/data/mock/proyectos";
import { ProyectoCard } from "@/features/proyectos/ProyectoCard";
import { FiltrosProyecto } from "@/features/proyectos/FiltrosProyecto";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  searchParams: { estado?: string; tema?: string; busqueda?: string };
}

export default function ProyectosPage({ searchParams }: Props) {
  let proyectos = proyectosMock;

  if (searchParams.estado)   proyectos = proyectos.filter((p) => p.estado === searchParams.estado);
  if (searchParams.tema)     proyectos = proyectos.filter((p) => p.temas.some((t) => t.slug === searchParams.tema));
  if (searchParams.busqueda) {
    const q = searchParams.busqueda.toLowerCase();
    proyectos = proyectos.filter((p) => p.titulo.toLowerCase().includes(q) || p.codigo.includes(q));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proyectos de ley</h1>
        <span className="text-sm text-gray-500">{proyectos.length} resultados</span>
      </div>
      <div className="mb-6">
        <FiltrosProyecto />
      </div>
      {proyectos.length === 0 ? (
        <EmptyState titulo="Sin resultados" descripcion="No hay proyectos con esos filtros." icono="🔍" />
      ) : (
        <div className="grid gap-4">
          {proyectos.map((p) => <ProyectoCard key={p.id} proyecto={p} />)}
        </div>
      )}
    </div>
  );
}
```

```tsx
// /app/proyectos/[id]/page.tsx
import { proyectosMock } from "@/data/mock/proyectos";
import { notFound } from "next/navigation";
import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { TimelineLegislativa } from "@/components/ui/TimelineLegislativa";
import { TablaVotos } from "@/components/ui/TablaVotos";
import { formatearFecha } from "@/lib/utils";
import Link from "next/link";

export default function ProyectoDetallePage({ params }: { params: { id: string } }) {
  const proyecto = proyectosMock.find((p) => p.id === params.id);
  if (!proyecto) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-mono text-gray-400">Exp. #{proyecto.codigo}</span>
          <BadgeEstado estado={proyecto.estado} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{proyecto.titulo}</h1>
        <p className="text-gray-600 leading-relaxed">{proyecto.descripcion}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-400 mb-1">Proponente</p>
          <Link href={`/diputados/${proyecto.proponente.id}`} className="font-medium text-blue-700 hover:underline">
            {proyecto.proponente.nombre}
          </Link>
          <p className="text-gray-500">{proyecto.proponente.partido.nombre}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-400 mb-1">Comisión</p>
          <p className="font-medium">{proyecto.comisionNombre || "Sin asignar"}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-400 mb-1">Presentado</p>
          <p className="font-medium">{formatearFecha(proyecto.fechaPresentacion)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-400 mb-1">Último cambio</p>
          <p className="font-medium">{formatearFecha(proyecto.fechaUltimoCambio)}</p>
        </div>
      </div>

      {proyecto.temas.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {proyecto.temas.map((t) => (
            <span key={t.id} className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: t.colorHex + "20", color: t.colorHex }}>
              {t.nombre}
            </span>
          ))}
        </div>
      )}

      {proyecto.historial.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-4">Historial</h2>
          <TimelineLegislativa historial={proyecto.historial} />
        </section>
      )}

      {proyecto.votos.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-4">Votación</h2>
          <TablaVotos votos={proyecto.votos} />
        </section>
      )}
    </div>
  );
}
```

```tsx
// /app/diputados/page.tsx
import { diputadosMock } from "@/data/mock/diputados";
import Link from "next/link";
import { formatearMoneda } from "@/lib/utils";

export default function DiputadosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Diputados</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {diputadosMock.map((d) => (
          <Link key={d.id} href={`/diputados/${d.id}`}>
            <div className="border rounded-xl p-4 hover:shadow-md transition bg-white">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-400 flex-shrink-0">
                  {d.nombre[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{d.nombre}</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: d.partido.colorHex }}>
                    {d.partido.nombre}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">Salario: {formatearMoneda(d.salario)}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## Layout y Navbar

```tsx
// /components/layout/Navbar.tsx
import Link from "next/link";

const NAV = [
  { href: "/",           label: "Inicio"    },
  { href: "/proyectos",  label: "Proyectos" },
  { href: "/diputados",  label: "Diputados" },
  { href: "/comisiones", label: "Comisiones"},
];

export function Navbar() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-blue-700 tracking-tight">GOBi</Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className="px-3 py-2 text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition">
              {item.label}
            </Link>
          ))}
        </nav>
        <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          Iniciar sesión
        </button>
      </div>
    </header>
  );
}
```

---

## Entregable de Fase 1

- [ ] Setup Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Todos los tipos definidos en `/types/index.ts`
- [ ] Mock data completo: proyectos, diputados, comisiones, comunicados, temas
- [ ] Componentes UI: BadgeEstado, BadgePrioridad, EmptyState, SkeletonCard, TimelineLegislativa, TablaVotos
- [ ] Feed home con BadgePrioridad (urgente / en debate / actualizado)
- [ ] Listado de proyectos con filtros por estado, tema y búsqueda en URL
- [ ] Detalle de proyecto con timeline y tabla de votos
- [ ] Listado de diputados con card básica
- [ ] Navbar funcional con links a todas las secciones
- [ ] Layout responsive

---

## Prompts para tu editor de IA

```
Proyecto: GOBi — plataforma cívica costarricense
Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui
Fase: 1 — solo frontend, datos mock, sin backend

Tipos disponibles en /types/index.ts: ProyectoLey, Diputado, Comision,
  Comunicado, Voto, CambioEstado, EstadoProyecto, PrioridadFeed, etc.
Mock data en /data/mock/: proyectos.ts, diputados.ts, comisiones.ts, comunicados.ts, temas.ts
Componentes disponibles: BadgeEstado, BadgePrioridad, EmptyState, SkeletonCard,
  TimelineLegislativa, TablaVotos

Tarea: [describe lo que construyes]

Reglas:
- Componentes pequeños, una responsabilidad cada uno
- Filtros siempre reflejados en URL como query params (nunca useState)
- Siempre incluir EmptyState cuando no hay resultados
- Estructura: /components/ui/, /features/{modulo}/, /data/mock/
```

Siguiente: GOBi_02_fase-backend-fastapi.md
