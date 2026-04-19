import { ListadoDiputados } from "@/features/diputados/ListadoDiputados";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diputados | GOBi",
};

export default function DiputadosPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Directorio Legislativo</h1>
        <p className="text-gray-500">
          Conoce a las diputaciones de la Asamblea Legislativa actual, sus comisiones y partidos políticos.
        </p>
      </div>

      <ListadoDiputados />
    </div>
  );
}
