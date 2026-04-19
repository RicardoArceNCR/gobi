# GOBi — Fase 4: Sistema de Diseño

> **Objetivo:** Consistencia visual en toda la app. Que cada pantalla parezca hecha por la misma persona con el mismo criterio.

> **Prerequisito:** Fase 3 completada — datos reales en todas las vistas.

---

## Contexto para tu editor de IA

```
Proyecto: GOBi — plataforma de inteligencia política costarricense
Stack: Next.js + TypeScript + Tailwind CSS + shadcn/ui
Fase: 4 — sistema de diseño consistente
Regla: si el mismo componente existe en dos lugares con estilos diferentes, está mal.
```

---

## Tokens de diseño

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
        estado: {
          presentado:  "#6b7280",
          en_comision: "#d97706",
          en_debate:   "#2563eb",
          votado:      "#7c3aed",
          aprobado:    "#16a34a",
          archivado:   "#dc2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "0.75rem",  // 12px — todas las cards
      },
    },
  },
};

export default config;
```

---

## Reglas de consistencia (no negociables)

| Elemento | Regla |
|---|---|
| Cards | `rounded-xl border bg-white p-4 hover:shadow-md transition` siempre |
| Estado legislativo | Siempre `<BadgeEstado>` — nunca texto plano o colores ad hoc |
| Prioridad del feed | Siempre `<BadgePrioridad>` |
| Skeleton | Siempre en lugar de spinners genéricos |
| Vacío | Siempre `<EmptyState>` con ícono y descripción |
| Error | Siempre `<EmptyState icono="⚠️">` con mensaje |
| Títulos de sección | `font-semibold text-gray-900` |
| Texto secundario | `text-sm text-gray-500` |
| Spacing entre secciones | `space-y-8` en páginas de detalle |
| Links internos | `text-blue-700 hover:underline` |

---

## Componentes del sistema (nuevos en esta fase)

```tsx
// /components/ui/MetricaCard.tsx
interface Props {
  label: string;
  valor: string | number;
  subtexto?: string;
  colorClase?: string;
}

export function MetricaCard({ label, valor, subtexto, colorClase = "text-gray-900" }: Props) {
  return (
    <div className="border rounded-xl p-4 bg-white text-center">
      <p className={`text-2xl font-bold ${colorClase}`}>{valor}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {subtexto && <p className="text-xs text-gray-400 mt-0.5">{subtexto}</p>}
    </div>
  );
}
```

```tsx
// /components/ui/SeccionDetalle.tsx
interface Props {
  titulo: string;
  children: React.ReactNode;
  accion?: React.ReactNode;
}

export function SeccionDetalle({ titulo, children, accion }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}
```

```tsx
// /components/ui/InfoGrid.tsx
interface InfoItem {
  label: string;
  valor: React.ReactNode;
}

export function InfoGrid({ items }: { items: InfoItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">{item.label}</p>
          <div className="font-medium text-gray-900 text-sm">{item.valor}</div>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// /components/ui/LinkInterno.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function LinkInterno({ href, children, className }: Props) {
  return (
    <Link href={href} className={cn("text-blue-700 hover:underline font-medium", className)}>
      {children}
    </Link>
  );
}
```

---

## Sidebar de navegación

```tsx
// /components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",           icono: "🏠", label: "Inicio"     },
  { href: "/proyectos",  icono: "📋", label: "Proyectos"  },
  { href: "/diputados",  icono: "👤", label: "Diputados"  },
  { href: "/comisiones", icono: "🏛️", label: "Comisiones" },
  // /partidos se agrega en fases posteriores cuando exista la ruta
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const activo = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition",
              activo
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <span>{item.icono}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

---

## AppLayout completo

```tsx
// /components/layout/AppLayout.tsx
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <aside className="w-56 flex-shrink-0 hidden lg:block sticky top-20 h-fit">
          <Sidebar />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
```

---

## Perfil de diputado con métricas

```tsx
// /features/diputados/DiputadoDetalle.tsx
"use client";

import { useDiputado } from "./hooks";
import { MetricaCard } from "@/components/ui/MetricaCard";
import { InfoGrid } from "@/components/ui/InfoGrid";
import { SeccionDetalle } from "@/components/ui/SeccionDetalle";
import { ProyectoCard } from "@/features/proyectos/ProyectoCard";
import { formatearMoneda } from "@/lib/utils";

export function DiputadoDetalle({ id }: { id: string }) {
  const { data: diputado, isLoading } = useDiputado(id);

  if (isLoading) return <div className="animate-pulse space-y-4">...</div>;
  if (!diputado) return null;

  const aprobados = diputado.proyectos?.filter((p: any) => p.estado === "aprobado").length ?? 0;
  const votosAFavor = diputado.votos?.filter((v: any) => v.valor === "a_favor").length ?? 0;

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {diputado.foto_url ? (
            <img src={diputado.foto_url} alt={diputado.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
              {diputado.nombre[0]}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{diputado.nombre}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="px-2 py-0.5 rounded text-sm font-medium text-white"
              style={{ backgroundColor: diputado.partido?.color_hex }}
            >
              {diputado.partido?.nombre}
            </span>
            <span className="text-sm text-gray-500">Diputado/a</span>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricaCard label="Proyectos" valor={diputado.proyectos?.length ?? 0} />
        <MetricaCard label="Aprobados" valor={aprobados} colorClase="text-green-600" />
        <MetricaCard label="Votos a favor" valor={votosAFavor} />
        <MetricaCard label="Salario" valor={formatearMoneda(diputado.salario)} subtexto="mensual" />
      </div>

      {/* Info */}
      <InfoGrid items={[
        { label: "Gasolina mensual", valor: formatearMoneda(diputado.monto_gasolina) },
        { label: "Desde", valor: diputado.fecha_inicio },
        { label: "Comisiones", valor: diputado.comisiones?.length ?? 0 },
      ]} />

      {/* Proyectos */}
      {diputado.proyectos?.length > 0 && (
        <SeccionDetalle titulo="Proyectos presentados">
          <div className="grid gap-3">
            {diputado.proyectos.slice(0, 5).map((p: any) => (
              <ProyectoCard key={p.id} proyecto={p} />
            ))}
          </div>
        </SeccionDetalle>
      )}
    </div>
  );
}
```

---

## Feed home con jerarquía visual

```tsx
// /features/feed/FeedItem.tsx
import Link from "next/link";
import { Comunicado } from "@/types";
import { BadgePrioridad } from "@/components/ui/BadgePrioridad";
import { formatearFecha } from "@/lib/utils";

export function FeedItem({ comunicado }: { comunicado: Comunicado }) {
  return (
    <article className="border rounded-xl p-4 bg-white hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2 mb-2">
        <BadgePrioridad prioridad={comunicado.prioridad} />
        <span className="text-xs text-gray-400 flex-shrink-0">{formatearFecha(comunicado.fecha)}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{comunicado.titulo}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{comunicado.contenido}</p>

      {/* Conexiones relacionales */}
      <div className="flex gap-2 flex-wrap text-xs">
        {comunicado.proyectoId && (
          <Link href={`/proyectos/${comunicado.proyectoId}`}
            className="text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded">
            📋 {comunicado.proyectoTitulo?.slice(0, 40)}...
          </Link>
        )}
        {comunicado.diputadoId && (
          <Link href={`/diputados/${comunicado.diputadoId}`}
            className="text-purple-600 hover:underline bg-purple-50 px-2 py-0.5 rounded">
            👤 {comunicado.diputadoNombre}
          </Link>
        )}
        {comunicado.comisionId && (
          <Link href={`/comisiones/${comunicado.comisionId}`}
            className="text-green-600 hover:underline bg-green-50 px-2 py-0.5 rounded">
            🏛️ {comunicado.comisionNombre}
          </Link>
        )}
      </div>
    </article>
  );
}
```

---

## Entregable de Fase 4

- [ ] `tailwind.config.ts` con tokens de color y tipografía
- [ ] `AppLayout` con Navbar + Sidebar sticky
- [ ] `Sidebar` con active state por ruta
- [ ] `MetricaCard`, `InfoGrid`, `SeccionDetalle`, `LinkInterno`
- [ ] `FeedItem` con links relacionales a proyecto, diputado y comisión
- [ ] Perfil de diputado con métricas (proyectos, aprobados, salario, gasolina)
- [ ] Dark mode opcional
- [ ] Responsive verificado en móvil (Sidebar oculto en < lg)
- [ ] Ninguna pantalla tiene spinner genérico — todo usa skeleton

---

## Prompts para tu editor de IA

```
Proyecto: GOBi — plataforma cívica costarricense
Stack: Next.js, TypeScript, Tailwind CSS, shadcn/ui
Fase: 4 — sistema de diseño

Componentes disponibles:
- BadgeEstado, BadgePrioridad (nunca inventar badges nuevos)
- MetricaCard, InfoGrid, SeccionDetalle, LinkInterno
- EmptyState, SkeletonCard
- TimelineLegislativa, TablaVotos

Tokens de diseño:
- Cards: rounded-xl border bg-white p-4 hover:shadow-md transition
- Títulos: font-semibold text-gray-900
- Secundario: text-sm text-gray-500
- Links: text-blue-700 hover:underline

Tarea: [describe el componente o pantalla]

Regla: si quieres agregar un nuevo componente UI, verifica que no existe ya en la lista de arriba.
```

Siguiente: GOBi_05_fase-auth-roles.md
