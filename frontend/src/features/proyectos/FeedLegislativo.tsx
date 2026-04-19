"use client";

import { useProyectos } from "./hooks";
import { ProyectoCard } from "./ProyectoCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { EmptyState } from "@/components/ui/EmptyState";

const PRIORIDAD_PESO: Record<string, number> = {
  urgente: 4,
  en_debate: 3,
  actualizado: 2,
  seguido: 1,
};

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
    return <EmptyState icono="⚠️" titulo="Error al cargar el feed legislativo" />;
  }

  if (!data?.items?.length) {
    return <EmptyState icono="🔍" titulo="No hay actividad reciente" />;
  }

  // Ordenamos usando el campo prioridad que viene tipado
  const feed = [...data.items].sort((a, b) => {
    const pesoA = a.prioridad ? PRIORIDAD_PESO[a.prioridad] || 0 : 0;
    const pesoB = b.prioridad ? PRIORIDAD_PESO[b.prioridad] || 0 : 0;

    if (pesoA !== pesoB) {
      return pesoB - pesoA;
    }

    return new Date(b.fechaUltimoCambio).getTime() - new Date(a.fechaUltimoCambio).getTime();
  });

  return (
    <div className="space-y-6">
      {feed.map((proyecto) => (
        <ProyectoCard key={proyecto.id} proyecto={proyecto} />
      ))}
    </div>
  );
}
