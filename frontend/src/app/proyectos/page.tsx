import { FiltrosProyecto } from "@/features/proyectos/FiltrosProyecto";
import { ProyectoCard } from "@/features/proyectos/ProyectoCard";
import { PROYECTOS } from "@/data/mock/proyectos";
import { EmptyState } from "@/components/ui/EmptyState";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Proyectos de Ley | GOBi",
};

export default function ProyectosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q.toLowerCase() : "";
  const estado = typeof searchParams.estado === "string" ? searchParams.estado : "";
  const tema = typeof searchParams.tema === "string" ? searchParams.tema : "";

  const filteredProyectos = PROYECTOS.filter((p) => {
    if (estado && p.estado !== estado) return false;
    if (tema && !p.temas.some((t) => t.slug === tema)) return false;
    if (q) {
      return (
        p.titulo.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Proyectos de Ley</h1>
        <p className="text-gray-500 mt-2">
          Explora y filtra los expedientes legislativos.
        </p>
      </div>

      <Suspense fallback={null}>
        <FiltrosProyecto />
      </Suspense>

      {filteredProyectos.length === 0 ? (
        <EmptyState
          icono="📭"
          titulo="No se encontraron proyectos"
          descripcion="Intenta ajustar tus filtros o la barra de búsqueda para obtener resultados."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProyectos.map((proyecto) => (
            <ProyectoCard key={proyecto.id} proyecto={proyecto} />
          ))}
        </div>
      )}
    </div>
  );
}
