"use client";

import { useComisiones } from "./hooks";
import { EmptyState } from "@/components/ui/EmptyState";

export function ListadoComisiones() {
  const { data, isLoading, isError } = useComisiones({});

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-xl p-5 bg-white animate-pulse h-40"></div>
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

  if (!data?.length) {
    return (
      <EmptyState
        icono="📭"
        titulo="No se encontraron comisiones"
        descripcion="Intenta ajustar tus filtros para ver resultados."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((comision) => (
        <div key={comision.id} className="border rounded-xl p-6 bg-white hover:shadow-md transition">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{comision.nombre}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{comision.descripcion}</p>
          
          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3 mt-auto">
            <div className="text-center">
              <span className="block text-xs uppercase font-bold text-gray-400">Miembros</span>
              <span className="text-sm font-semibold text-gray-700">{comision.miembros?.length || 0}</span>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-center">
              <span className="block text-xs uppercase font-bold text-gray-400">Proyectos</span>
              <span className="text-sm font-semibold text-gray-700">{comision.proyectosActivos || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
