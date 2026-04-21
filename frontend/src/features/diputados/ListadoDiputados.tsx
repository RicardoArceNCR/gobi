"use client";

import Link from "next/link";
import { useDiputados } from "./hooks";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Paginacion } from "@/components/ui/Paginacion";
import Image from "next/image";

import type { FiltrosDiputados } from "@/types";

export function ListadoDiputados({ filtros = {} }: { filtros?: FiltrosDiputados }) {
  const { data, isLoading, isError } = useDiputados(filtros);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icono="⚠️"
        titulo="Error al cargar directorio"
        descripcion="Hubo un problema comunicándose con el servidor."
      />
    );
  }

  if (!data?.items?.length) {
    return (
      <EmptyState
        icono="📭"
        titulo="No se encontraron diputados"
        descripcion="Intenta ajustar tus filtros para ver resultados."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">
        {data.total} diputado{data.total === 1 ? "" : "s"} encontrado{data.total === 1 ? "" : "s"}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.items.map((diputado) => (
          <Link
            key={diputado.id}
            href={`/diputados/${diputado.id}`}
            className="border rounded-xl p-5 bg-white hover:shadow-md transition flex flex-col items-center text-center group"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl mb-4 text-white shadow-sm ring-4 ring-offset-2 ring-gray-50 bg-gray-100 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: diputado.partido?.colorHex || "#9ca3af" }}
            >
              {diputado.fotoUrl ? (
                <Image
                  src={diputado.fotoUrl}
                  alt={diputado.nombre}
                  width={80}
                  height={80}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                diputado.nombre.charAt(0)
              )}
            </div>

            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition">
              {diputado.nombre}
            </h3>

            <div className="flex items-center gap-1.5 justify-center mb-4">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: diputado.partido?.colorHex || "#9ca3af" }}
              />
              <span className="text-xs text-gray-500 font-medium">
                {diputado.partido?.nombre || "Sin partido"}
              </span>
            </div>

            <div className="mt-auto w-full border-t pt-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Comisiones
              </span>
              <div className="text-xs text-gray-600 mt-1 font-medium">
                {diputado.comisionIds?.length || 0} asignadas
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Paginacion page={data.page} totalPages={data.totalPages} />
    </div>
  );
}
