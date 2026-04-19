import { PROYECTOS } from "@/data/mock/proyectos";
import { ProyectoCard } from "@/features/proyectos/ProyectoCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio | GOBi",
};

const PRIORIDAD_PESO: Record<string, number> = {
  urgente: 4,
  en_debate: 3,
  actualizado: 2,
  seguido: 1,
};

export default function HomePage() {
  // Feed de actividad legislativa ordenado por prioridad y luego por fecha
  const feed = [...PROYECTOS].sort((a, b) => {
    const pesoA = a.prioridad ? PRIORIDAD_PESO[a.prioridad] || 0 : 0;
    const pesoB = b.prioridad ? PRIORIDAD_PESO[b.prioridad] || 0 : 0;

    if (pesoA !== pesoB) {
      return pesoB - pesoA;
    }

    return new Date(b.fechaUltimoCambio).getTime() - new Date(a.fechaUltimoCambio).getTime();
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feed Legislativo</h1>
        <p className="text-gray-500">
          Últimas actualizaciones, proyectos urgentes y en debate.
        </p>
      </div>

      <div className="space-y-6">
        {feed.map((proyecto) => (
          <ProyectoCard key={proyecto.id} proyecto={proyecto} />
        ))}
      </div>
    </div>
  );
}