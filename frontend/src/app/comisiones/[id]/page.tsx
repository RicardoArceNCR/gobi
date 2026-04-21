import type { Metadata } from "next";
import { ComisionDetalleView } from "@/features/comisiones/ComisionDetalleView";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Detalle de comisión | GOBi",
  description: "Información detallada de comisión legislativa en GOBi",
};

export default async function ComisionDetallePage({ params }: PageProps) {
  const { id } = await params;
  return <ComisionDetalleView id={id} />;
}
