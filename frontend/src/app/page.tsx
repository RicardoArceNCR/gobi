import type { Metadata } from "next";
import { FeedLegislativo } from "@/features/proyectos/FeedLegislativo";

export const metadata: Metadata = {
  title: "Inicio | GOBi",
  description:
    "Actividad legislativa reciente, proyectos y contexto político navegable.",
};

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feed Legislativo</h1>
        <p className="text-gray-500">
          Últimas actualizaciones, proyectos urgentes y en debate.
        </p>
      </div>

      <FeedLegislativo />
    </div>
  );
}
