# GOBi — Fase 6: Panel Administrativo

> **Objetivo:** El producto se vuelve operativo. CRUDs completos, cambio de estados con auditoría, gestión de documentos.

> **Prerequisito:** Fase 5 completada — auth y roles funcionando.

---

## Contexto para tu editor de IA

```
Proyecto: GOBi — plataforma cívica costarricense
Stack: Next.js + TypeScript + Tailwind + shadcn/ui + React Hook Form + Zod + React Query
Fase: 6 — panel administrativo (acceso solo rol "admin")
Regla: todo cambio de estado requiere motivo. Todo CRUD queda en bitácora.
```

---

## Instalación

```bash
npm install react-hook-form zod @hookform/resolvers
npm install @tanstack/react-table
```

---

## Estructura del panel admin

```
/app/admin
  layout.tsx                    ← Guard de rol admin
  page.tsx                      ← Dashboard: resumen + últimos cambios
  /proyectos
    page.tsx                    ← Tabla con acciones
    /nuevo/page.tsx
    /[id]/editar/page.tsx
  /diputados
    page.tsx
    /[id]/editar/page.tsx
  /usuarios
    page.tsx                    ← Gestión de roles
  /bitacora
    page.tsx
```

---

## Guard de rol en layout

```tsx
// /app/admin/layout.tsx
"use client";

import Link from "next/link";
import { useUsuario } from "@/hooks/useUsuario";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, usuario } = useUsuario();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !usuario?.esAdmin) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, usuario]);

  if (!isLoaded || !usuario?.esAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Verificando acceso...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <aside className="w-52 flex-shrink-0 hidden lg:block">
          <nav className="space-y-1">
            {[
              { href: "/admin",           label: "Dashboard" },
              { href: "/admin/proyectos", label: "Proyectos" },
              { href: "/admin/diputados", label: "Diputados" },
              { href: "/admin/usuarios",  label: "Usuarios"  },
              { href: "/admin/bitacora",  label: "Bitácora"  },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="block px-3 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
```

---

## Schema de validación

```typescript
// /features/admin/proyectos/schema.ts
import { z } from "zod";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const proyectoSchema = z.object({
  codigo: z.string().min(3, "Mínimo 3 caracteres").max(20, "Máximo 20 caracteres"),
  titulo: z.string().min(10, "El título debe ser más descriptivo"),
  descripcion: z.string().min(30, "La descripción debe tener al menos 30 caracteres"),
  texto_completo: z.string().optional(),
  estado: z.enum(["presentado", "en_comision", "en_debate", "votado", "aprobado", "archivado"]),
  fecha_presentacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD"),
  proponente_id: z.string().regex(UUID_REGEX, "Selecciona un proponente válido"),
  comision_id: z.string().regex(UUID_REGEX).optional().or(z.literal("")),
  tema_ids: z.array(z.string()).min(1, "Selecciona al menos un tema"),
});

export const cambioEstadoSchema = z.object({
  estado_nuevo: z.enum(["presentado", "en_comision", "en_debate", "votado", "aprobado", "archivado"]),
  motivo: z.string().min(10, "El motivo debe tener al menos 10 caracteres"),
});

export type ProyectoFormData = z.infer<typeof proyectoSchema>;
export type CambioEstadoData = z.infer<typeof cambioEstadoSchema>;
```

---

## Formulario de proyecto

```tsx
// /features/admin/proyectos/FormularioProyecto.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { proyectoSchema, ProyectoFormData } from "./schema";
import { useDiputados } from "@/features/diputados/hooks";
import { temasMock } from "@/data/mock/temas";

interface Props {
  defaultValues?: Partial<ProyectoFormData>;
  onSubmit: (data: ProyectoFormData) => Promise<void>;
  isLoading?: boolean;
  modo: "crear" | "editar";
}

const ESTADOS = [
  { valor: "presentado", label: "Presentado" },
  { valor: "en_comision", label: "En comisión" },
  { valor: "en_debate", label: "En debate" },
  { valor: "votado", label: "Votado" },
  { valor: "aprobado", label: "Aprobado" },
  { valor: "archivado", label: "Archivado" },
] as const;

export function FormularioProyecto({ defaultValues, onSubmit, isLoading, modo }: Props) {
  const { data: diputados } = useDiputados();
  const { data: temasData } = useQuery({
    queryKey: ["temas"],
    queryFn: () => api.get("/temas").then((r) => r.data.items),
  });
  const temas = temasData ?? [];
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ProyectoFormData>({
    resolver: zodResolver(proyectoSchema),
    defaultValues: { estado: "presentado", tema_ids: [], ...defaultValues },
  });

  const temaIdsSeleccionados = watch("tema_ids");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

      {/* Código */}
      <Campo label="Código de expediente" error={errors.codigo?.message}>
        <input {...register("codigo")} placeholder="Ej: 24193"
          className={inputClase(!!errors.codigo)} />
      </Campo>

      {/* Título */}
      <Campo label="Título del proyecto" error={errors.titulo?.message}>
        <input {...register("titulo")} className={inputClase(!!errors.titulo)} />
      </Campo>

      {/* Descripción */}
      <Campo label="Descripción" error={errors.descripcion?.message}>
        <textarea {...register("descripcion")} rows={3}
          className={inputClase(!!errors.descripcion)} />
      </Campo>

      {/* Texto completo */}
      <Campo label="Texto completo (opcional)" error={errors.texto_completo?.message}>
        <textarea {...register("texto_completo")} rows={6}
          className={inputClase(false)} placeholder="Pega aquí el texto legal completo..." />
      </Campo>

      {/* Estado */}
      <Campo label="Estado" error={errors.estado?.message}>
        <select {...register("estado")} className={inputClase(!!errors.estado)}>
          {ESTADOS.map((e) => (
            <option key={e.valor} value={e.valor}>{e.label}</option>
          ))}
        </select>
      </Campo>

      {/* Fecha */}
      <Campo label="Fecha de presentación" error={errors.fecha_presentacion?.message}>
        <input {...register("fecha_presentacion")} type="date"
          className={inputClase(!!errors.fecha_presentacion)} />
      </Campo>

      {/* Proponente */}
      <Campo label="Diputado/a proponente" error={errors.proponente_id?.message}>
        <select {...register("proponente_id")} className={inputClase(!!errors.proponente_id)}>
          <option value="">Seleccionar...</option>
          {diputados?.items?.map((d: any) => (
            <option key={d.id} value={d.id}>{d.nombre} — {d.partido?.nombre}</option>
          ))}
        </select>
      </Campo>

      {/* Temas */}
      <Campo label="Temas" error={errors.tema_ids?.message}>
        <Controller
          control={control}
          name="tema_ids"
          render={({ field }) => (
            <div className="flex gap-2 flex-wrap">
              {temas.map((tema) => {
                const activo = field.value.includes(tema.id);
                return (
                  <button
                    key={tema.id}
                    type="button"
                    onClick={() => {
                      field.onChange(
                        activo
                          ? field.value.filter((id: string) => id !== tema.id)
                          : [...field.value, tema.id]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition ${
                      activo ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {tema.nombre}
                  </button>
                );
              })}
            </div>
          )}
        />
      </Campo>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {isLoading ? "Guardando..." : modo === "crear" ? "Crear proyecto" : "Guardar cambios"}
      </button>
    </form>
  );
}

// Helpers de estilo
function inputClase(error: boolean) {
  return `w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    error ? "border-red-400 focus:ring-red-400" : "border-gray-300"
  }`;
}

function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
```

---

## Panel de cambio de estado

```tsx
// /features/admin/proyectos/PanelCambioEstado.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cambioEstadoSchema, CambioEstadoData } from "./schema";
import { useCambiarEstado } from "@/features/proyectos/hooks";
import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { EstadoProyecto } from "@/types";

const TRANSICIONES: Record<EstadoProyecto, EstadoProyecto[]> = {
  presentado:  ["en_comision", "archivado"],
  en_comision: ["en_debate", "archivado"],
  en_debate:   ["votado", "archivado"],
  votado:      ["aprobado", "archivado"],
  aprobado:    [],
  archivado:   [],
};

interface Props {
  proyectoId: string;
  estadoActual: EstadoProyecto;
}

export function PanelCambioEstado({ proyectoId, estadoActual }: Props) {
  const { mutate, isPending, isSuccess, reset } = useCambiarEstado();
  const transicionesValidas = TRANSICIONES[estadoActual];

  const { register, handleSubmit, formState: { errors }, reset: resetForm } = useForm<CambioEstadoData>({
    resolver: zodResolver(cambioEstadoSchema),
  });

  if (!transicionesValidas.length) {
    return (
      <div className="border rounded-xl p-4 bg-gray-50 text-center text-sm text-gray-400">
        Este proyecto ya no puede cambiar de estado
      </div>
    );
  }

  const onSubmit = (data: CambioEstadoData) => {
    mutate(
      { id: proyectoId, estado: data.estado_nuevo, motivo: data.motivo },
      {
        onSuccess: () => {
          resetForm();
          setTimeout(reset, 3000);
        },
      }
    );
  };

  return (
    <div className="border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-900">Cambiar estado</h3>
        <span className="text-gray-400 text-sm">·</span>
        <span className="text-sm text-gray-500">Estado actual:</span>
        <BadgeEstado estado={estadoActual} />
      </div>

      {isSuccess && (
        <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">
          ✓ Estado actualizado correctamente
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Nuevo estado</label>
          <select {...register("estado_nuevo")}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Seleccionar...</option>
            {transicionesValidas.map((e) => (
              <option key={e} value={e}>{e.replace("_", " ")}</option>
            ))}
          </select>
          {errors.estado_nuevo && <p className="text-red-500 text-xs mt-1">{errors.estado_nuevo.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Motivo <span className="text-red-400">*</span>
          </label>
          <textarea {...register("motivo")} rows={3}
            placeholder="Describe el motivo del cambio de estado..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.motivo && <p className="text-red-500 text-xs mt-1">{errors.motivo.message}</p>}
        </div>

        <button type="submit" disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition">
          {isPending ? "Aplicando..." : "Aplicar cambio"}
        </button>
      </form>
    </div>
  );
}
```

---

## Tabla de bitácora

```tsx
// /app/admin/bitacora/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export default function BitacoraPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["bitacora"],
    queryFn: async () => {
      const { data } = await api.get("/bitacora");
      return data;
    },
  });

  const accionBadge: Record<string, string> = {
    creacion:      "bg-green-100 text-green-800",
    edicion:       "bg-blue-100 text-blue-800",
    cambio_estado: "bg-yellow-100 text-yellow-800",
    eliminacion:   "bg-red-100 text-red-800",
  };

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Bitácora de cambios</h1>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Fecha", "Acción", "Entidad", "Campo", "Antes → Después", "Usuario", "Motivo"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.items?.map((e: any) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{e.created_at?.slice(0, 16)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${accionBadge[e.accion] || "bg-gray-100 text-gray-600"}`}>
                    {e.accion}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{e.entidad_tipo}</td>
                <td className="px-4 py-3 text-gray-500">{e.campo_modificado || "—"}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {e.valor_anterior && e.valor_nuevo
                    ? <span>{e.valor_anterior} → <strong>{e.valor_nuevo}</strong></span>
                    : "—"}
                </td>
                <td className="px-4 py-3 text-gray-700">{e.usuario_nombre}</td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{e.motivo}</td>
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

## Hooks de mutación

> `useCambiarEstado` vive en `/features/proyectos/hooks.ts` porque es usado también en el frontend público.
> Los hooks solo-admin de crear/actualizar van en `/features/admin/hooks.ts`.

```typescript
// /features/admin/hooks.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { proyectosKeys } from "@/features/proyectos/hooks";

export function useCrearProyecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post("/proyectos", body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: proyectosKeys.all }),
  });
}

export function useActualizarProyecto(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.patch(`/proyectos/${id}`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: proyectosKeys.detail(id) });
      qc.invalidateQueries({ queryKey: proyectosKeys.all });
    },
  });
}
```

---

## Entregable de Fase 6

- [ ] Layout admin con guard de rol
- [ ] Sidebar de navegación admin
- [ ] Dashboard admin: resumen de totales por estado + últimas entradas de bitácora
- [ ] Listado de proyectos admin con columnas: código, título, estado, acciones (editar, cambiar estado)
- [ ] Formulario crear proyecto con validación Zod
- [ ] Formulario editar proyecto (pre-rellenado)
- [ ] Panel cambio de estado con transiciones válidas y motivo obligatorio
- [ ] Bitácora completa paginada
- [ ] Backend: endpoint GET /bitacora (solo admin)

---

## Prompts para tu editor de IA

```
Proyecto: GOBi — plataforma cívica costarricense
Stack: Next.js, TypeScript, Tailwind, shadcn/ui, React Hook Form, Zod, React Query, FastAPI
Fase: 6 — panel administrativo (solo rol "admin")

Validación: react-hook-form + zod (schema en /features/admin/proyectos/schema.ts)
Mutaciones: useMutation de React Query, invalidar queryKey correspondiente en onSuccess
Bitácora: servicio en backend app/services/bitacora.py → función registrar()

Transiciones válidas de estado:
  presentado → en_comision | archivado
  en_comision → en_debate | archivado
  en_debate → votado | archivado
  votado → aprobado | archivado
  aprobado / archivado → (sin transiciones)

Tarea: [describe lo que construyes]

Reglas:
- Motivo es OBLIGATORIO en todo cambio de estado (mínimo 10 caracteres)
- Cada mutación exitosa invalida el queryKey correcto
- Errores de validación siempre inline debajo del campo
- Botón de submit deshabilitado mientras isPending
```

Siguiente: GOBi_07_fase-ai-y-escala.md
