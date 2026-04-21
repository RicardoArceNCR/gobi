import type { Metadata } from "next";
import { DiputadoDetalleView } from "@/features/diputados/DiputadoDetalleView";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Detalle de diputado | GOBi",
  description: "Perfil legislativo de diputado en GOBi",
};

export default async function DiputadoDetallePage({ params }: PageProps) {
  const { id } = await params;
  return <DiputadoDetalleView id={id} />;
}
