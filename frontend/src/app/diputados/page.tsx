import { ListadoDiputados } from "@/features/diputados/ListadoDiputados";
import { FiltrosDiputados } from "@/features/diputados/FiltrosDiputados";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Diputados | GOBi",
};

type Props = {
  searchParams?: Promise<{
    busqueda?: string;
    partido?: string;
    page?: string;
  }>;
};

export default async function DiputadosPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};

  const filtros = {
    busqueda: params.busqueda ?? undefined,
    partido: params.partido ?? undefined,
    page: params.page ? Number(params.page) : 1,
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Directorio Legislativo</h1>
        <p className="text-gray-500">
          Conoce a las diputaciones de la Asamblea Legislativa actual, sus comisiones y partidos políticos.
        </p>
      </div>

      <Suspense fallback={<div className="h-20 bg-gray-50 animate-pulse rounded-xl mb-6" />}>
        <FiltrosDiputados />
      </Suspense>
      <ListadoDiputados filtros={filtros} />
    </div>
  );
}
