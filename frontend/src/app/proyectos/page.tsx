import { FiltrosProyecto } from "@/features/proyectos/FiltrosProyecto";
import { ListadoProyectos } from "@/features/proyectos/ListadoProyectos";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Proyectos de Ley | GOBi",
};

export default function ProyectosPage() {
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
        <ListadoProyectos />
      </Suspense>
    </div>
  );
}
