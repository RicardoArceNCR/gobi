"use client";

import Link from "next/link";
import { useComisiones } from "./hooks";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Paginacion } from "@/components/ui/Paginacion";

export function ListadoComisiones() {
  const { data, isLoading, isError } = useComisiones({});

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icono="⚠️"
        titulo="Error al cargar comisiones"
        descripcion="Hubo un problema comunicándose con el servidor."
      />
    );
  }

  if (!data?.items?.length) {
    return (
      <EmptyState
        icono="📭"
        titulo="No se encontraron comisiones"
        descripcion="Intenta ajustar tus filtros para ver resultados."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">
        {data.total} comision{data.total === 1 ? "" : "es"} encontrada{data.total === 1 ? "" : "s"}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((comision) => (
          <Link
            key={comision.id}
            href={`/comisiones/${comision.id}`}
            className="group border rounded-2xl p-6 bg-white hover:shadow-md hover:border-blue-200 transition flex flex-col"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition">
              {comision.nombre}
            </h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-3">
              {comision.descripcion || "Sin descripción disponible."}
            </p>

            <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3 mt-auto">
              <div className="text-center">
                <span className="block text-xs uppercase font-bold text-gray-400">
                  Miembros
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  {comision.miembrosCount ?? 0}
                </span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <span className="block text-xs uppercase font-bold text-gray-400">
                  Proyectos
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  {comision.proyectosActivos ?? 0}
                </span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400 group-hover:text-blue-500 transition">
              Ver detalle →
            </div>
          </Link>
        ))}
      </div>

      <Paginacion page={data.page} totalPages={data.totalPages} />
    </div>
  );
}
