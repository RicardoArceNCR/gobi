import { FiltrosProyecto } from "@/features/proyectos/FiltrosProyecto";
import { ListadoProyectos } from "@/features/proyectos/ListadoProyectos";
import { Metadata } from "next";
import { Suspense } from "react";
import type { FiltrosProyecto as FiltrosProyectoType } from "@/services/proyectos";

export const metadata: Metadata = {
  title: "Proyectos de Ley | GOBi",
};

type Props = {
  searchParams?: Promise<{
    busqueda?: string;
    estado?: string;
    tema?: string;
    partido?: string;
    page?: string;
  }>;
};

export default async function ProyectosPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};

  const filtros: FiltrosProyectoType = {
    busqueda: params.busqueda ?? "",
    estado: params.estado ?? undefined,
    tema: params.tema ?? "",
    partido: params.partido ?? "",
    page: params.page ? Number(params.page) : 1,
  };

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

      <Suspense fallback={null}>
        <ListadoProyectos filtros={filtros} />
      </Suspense>
    </div>
  );
}
