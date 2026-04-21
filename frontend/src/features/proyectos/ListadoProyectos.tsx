"use client";

import { useProyectos } from "./hooks";
import { ProyectoCard } from "./ProyectoCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Paginacion } from "@/components/ui/Paginacion";
import type { FiltrosProyecto } from "@/services/proyectos";

interface Props {
  filtros: FiltrosProyecto;
}

export function ListadoProyectos({ filtros }: Props) {
  const { data, isLoading, isError } = useProyectos(filtros);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        titulo="Error al cargar proyectos"
        descripcion="Hubo un problema al comunicarse con el servidor."
      />
    );
  }

  if (!data?.items?.length) {
    return (
      <EmptyState
        icono="📭"
        titulo="No se encontraron proyectos"
        descripcion="Intenta ajustar tus filtros o la barra de búsqueda para obtener resultados."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.items.map((proyecto) => (
          <ProyectoCard key={proyecto.id} proyecto={proyecto} />
        ))}
      </div>

      <Paginacion page={data.page} totalPages={data.totalPages} />
    </>
  );
}
