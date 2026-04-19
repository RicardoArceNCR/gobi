import { Metadata } from "next";
import { ProyectoDetalleView } from "@/features/proyectos/ProyectoDetalleView";

// Fetch directo en el servidor para Metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/proyectos/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.codigo} | GOBi`,
      };
    }
  } catch (e) {
    // ignorar fallo y hacer fallback
  }

  return {
    title: "Proyecto no encontrado | GOBi",
  };
}

export default function ProyectoDetailPage({ params }: { params: { id: string } }) {
  return <ProyectoDetalleView id={params.id} />;
}
