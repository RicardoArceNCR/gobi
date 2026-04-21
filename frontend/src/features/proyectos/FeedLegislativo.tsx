"use client";

import { useProyectos } from "./hooks";
import { ProyectoCard } from "./ProyectoCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { EmptyState } from "@/components/ui/EmptyState";

export function FeedLegislativo() {
  const { data, isLoading, isError } = useProyectos({});

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icono="⚠️"
        titulo="Error al cargar el feed legislativo"
        descripcion="Hubo un problema al obtener la actividad reciente."
      />
    );
  }

  if (!data?.items?.length) {
    return (
      <EmptyState
        icono="🔍"
        titulo="No hay actividad reciente"
        descripcion="Todavía no hay proyectos para mostrar en el feed."
      />
    );
  }

  const feed = [...data.items].sort(
    (a, b) =>
      new Date(b.fechaUltimoCambio || b.fechaPresentacion).getTime() -
      new Date(a.fechaUltimoCambio || a.fechaPresentacion).getTime()
  );

  return (
    <div className="space-y-6">
      {feed.map((proyecto) => (
        <ProyectoCard key={proyecto.id} proyecto={proyecto} />
      ))}
    </div>
  );
}
