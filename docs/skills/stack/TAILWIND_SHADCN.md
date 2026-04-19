# SKILL: Tailwind CSS + shadcn/ui

> Stack: Tailwind CSS v3 + shadcn/ui + Next.js 14

---

## Tokens de diseño GOBi

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        50: "#eff6ff", 100: "#dbeafe",
        500: "#3b82f6", 600: "#2563eb",
        700: "#1d4ed8", 900: "#1e3a8a",
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
  },
}
```

---

## Reglas de consistencia visual (no negociables)

| Elemento | Clase obligatoria |
|----------|-------------------|
| Card exterior | `border rounded-xl bg-white p-4 hover:shadow-md transition` |
| Card sin hover | `border rounded-xl bg-white p-4` |
| Card gris (info) | `bg-gray-50 rounded-xl p-4` |
| Título de página | `text-2xl font-bold text-gray-900` |
| Título de sección | `font-semibold text-gray-900` |
| Texto secundario | `text-sm text-gray-500` |
| Texto caption | `text-xs text-gray-400` |
| Link interno | `text-blue-700 hover:underline font-medium` |
| Botón primario | `bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50` |
| Botón secundario | `border border-blue-500 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition` |
| Input | `border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500` |
| Input error | `border-red-400 focus:ring-red-400` |
| Spacing secciones | `space-y-8` en páginas de detalle |
| Grid de cards | `grid gap-4` |

---

## Componentes UI del proyecto

### BadgeEstado
```tsx
// SIEMPRE usar este para estado legislativo — nunca ad hoc
const config = {
  presentado:  { clase: "bg-gray-100 text-gray-700",    etiqueta: "Presentado" },
  en_comision: { clase: "bg-yellow-100 text-yellow-800", etiqueta: "En comisión" },
  en_debate:   { clase: "bg-blue-100 text-blue-800",     etiqueta: "En debate" },
  votado:      { clase: "bg-purple-100 text-purple-800", etiqueta: "Votado" },
  aprobado:    { clase: "bg-green-100 text-green-800",   etiqueta: "Aprobado" },
  archivado:   { clase: "bg-red-100 text-red-800",       etiqueta: "Archivado" },
};
```

### BadgePrioridad
```tsx
// Para el feed home
const config = {
  urgente:     { clase: "bg-red-50 border border-red-200 text-red-700",     dot: "bg-red-500" },
  en_debate:   { clase: "bg-blue-50 border border-blue-200 text-blue-700",  dot: "bg-blue-500" },
  actualizado: { clase: "bg-green-50 border border-green-200 text-green-700",dot: "bg-green-500" },
  seguido:     { clase: "bg-gray-50 border border-gray-200 text-gray-600",  dot: "bg-gray-400" },
};
```

### EmptyState
```tsx
// Para vacío Y para error
<EmptyState icono="🔍" titulo="Sin resultados" descripcion="Prueba con otros filtros." />
<EmptyState icono="⚠️" titulo="Error al cargar" descripcion={error.message} />
```

### SkeletonCard
```tsx
// SIEMPRE en lugar de spinner genérico
<div className="border rounded-xl p-4 animate-pulse bg-white">
  <div className="flex justify-between mb-3">
    <div className="h-3 w-16 bg-gray-200 rounded" />
    <div className="h-5 w-24 bg-gray-200 rounded-full" />
  </div>
  <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
  <div className="h-4 w-full bg-gray-200 rounded mb-1" />
  <div className="h-4 w-2/3 bg-gray-200 rounded" />
</div>
```

### MetricaCard
```tsx
// Para dashboards de diputados, comisiones
<div className="border rounded-xl p-4 bg-white text-center">
  <p className="text-2xl font-bold text-gray-900">{valor}</p>
  <p className="text-sm text-gray-500 mt-1">{label}</p>
  {subtexto && <p className="text-xs text-gray-400 mt-0.5">{subtexto}</p>}
</div>
```

---

## shadcn/ui — componentes instalados

```bash
npx shadcn-ui@latest add badge button card separator skeleton dialog toast table
```

```tsx
// Uso de Dialog para modales
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={abierto} onOpenChange={setAbierto}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Cambiar estado</DialogTitle>
    </DialogHeader>
    {/* contenido */}
  </DialogContent>
</Dialog>
```

```tsx
// Toast para feedback
import { useToast } from "@/components/ui/use-toast";

const { toast } = useToast();
toast({ title: "Estado actualizado", description: "El proyecto pasó a debate." });
toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
```

---

## Layout responsive

```tsx
// Patrón sidebar + contenido
<div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
  <aside className="w-56 flex-shrink-0 hidden lg:block sticky top-20 h-fit">
    <Sidebar />
  </aside>
  <main className="flex-1 min-w-0">{children}</main>
</div>

// Grid de cards responsive
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

// Métricas responsive
<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
```

---

## Utilidades

```typescript
// /lib/utils.ts
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);  // combinar clases condicionalmente
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

**Uso de cn():**
```tsx
<button className={cn(
  "px-4 py-2 rounded-lg text-sm transition",
  activo ? "bg-blue-600 text-white" : "border text-gray-600",
  disabled && "opacity-50 cursor-not-allowed"
)}>
```

---

## Lo que NO hacer

```
❌ Crear un badge de estado con colores propios — usar BadgeEstado
❌ Usar spinner genérico (<div className="animate-spin">) — usar SkeletonCard
❌ Dejar pantalla vacía sin EmptyState
❌ Mezclar rounded-md y rounded-xl en cards del mismo tipo
❌ Padding distinto en cards del mismo tipo
❌ Clases de color inline (text-[#abc123]) — usar tokens del config
```