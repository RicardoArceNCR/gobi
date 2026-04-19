// /src/components/ui/BadgePrioridad.tsx
import { PrioridadFeed } from "@/types";
import { cn } from "@/lib/utils";

const config: Record<PrioridadFeed, { clase: string; dot: string; etiqueta: string }> = {
  urgente:     { clase: "bg-red-50 text-red-700 border border-red-200",       dot: "bg-red-500",    etiqueta: "Urgente"     },
  en_debate:   { clase: "bg-blue-50 text-blue-700 border border-blue-200",    dot: "bg-blue-500",   etiqueta: "En debate"   },
  actualizado: { clase: "bg-green-50 text-green-700 border border-green-200", dot: "bg-green-500",  etiqueta: "Actualizado" },
  seguido:     { clase: "bg-gray-50 text-gray-600 border border-gray-200",    dot: "bg-gray-400",   etiqueta: "Seguido"     },
};

export function BadgePrioridad({
  prioridad,
  className,
}: {
  prioridad: PrioridadFeed;
  className?: string;
}) {
  const { clase, dot, etiqueta } = config[prioridad];
  return (
    <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", clase, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {etiqueta}
    </span>
  );
}
