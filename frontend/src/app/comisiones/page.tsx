import { ListadoComisiones } from "@/features/comisiones/ListadoComisiones";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Comisiones | GOBi",
};

export default function ComisionesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Comisiones</h1>
        <p className="text-gray-500">
          Explora las comisiones legislativas, sus integrantes y los proyectos vinculados.
        </p>
      </div>

      <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-xl" />}>
        <ListadoComisiones />
      </Suspense>
    </div>
  );
}
