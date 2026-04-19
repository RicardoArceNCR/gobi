// /src/components/ui/BadgeEstado.tsx
import { cn } from "@/lib/utils";
import { EstadoProyecto } from "@/types";

const config: Record<EstadoProyecto, { clase: string; etiqueta: string }> = {
  presentado:  { clase: "bg-gray-100 text-gray-700",    etiqueta: "Presentado"  },
  en_comision: { clase: "bg-yellow-100 text-yellow-800", etiqueta: "En comisión" },
  en_debate:   { clase: "bg-blue-100 text-blue-800",     etiqueta: "En debate"   },
  votado:      { clase: "bg-purple-100 text-purple-800", etiqueta: "Votado"      },
  aprobado:    { clase: "bg-green-100 text-green-800",   etiqueta: "Aprobado"    },
  archivado:   { clase: "bg-red-100 text-red-800",       etiqueta: "Archivado"   },
};

export function BadgeEstado({
  estado,
  className,
}: {
  estado: EstadoProyecto;
  className?: string;
}) {
  const { clase, etiqueta } = config[estado];
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", clase, className)}>
      {etiqueta}
    </span>
  );
}
