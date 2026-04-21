import { Metadata } from "next";
import { ProyectoDetalleView } from "@/features/proyectos/ProyectoDetalleView";

type Props = {
  params: Promise<{ id: string }>;
};

// Fetch directo en el servidor para Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/proyectos/${id}`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.codigo} | GOBi`,
      };
    }
  } catch {
    // ignorar fallo y hacer fallback
  }

  return {
    title: "Proyecto no encontrado | GOBi",
  };
}

export default async function ProyectoDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProyectoDetalleView id={id} />;
}
