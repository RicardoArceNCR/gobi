// /src/components/ui/BadgeEstado.tsx
import { cn } from "@/lib/utils";
import { EstadoProyecto } from "@/types";

const config: Record<EstadoProyecto, { clase: string; etiqueta: string }> = {
  presentado: { clase: "bg-gray-100 text-gray-700", etiqueta: "Presentado" },
  en_comision: { clase: "bg-yellow-100 text-yellow-800", etiqueta: "En comisión" },
  en_debate: { clase: "bg-blue-100 text-blue-800", etiqueta: "En debate" },
  votado: { clase: "bg-purple-100 text-purple-800", etiqueta: "Votado" },
  aprobado: { clase: "bg-green-100 text-green-800", etiqueta: "Aprobado" },
  archivado: { clase: "bg-red-100 text-red-800", etiqueta: "Archivado" },
};

const fallback = {
  clase: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  etiqueta: "Estado desconocido",
};

interface BadgeEstadoProps {
  estado?: string | null;
  className?: string;
}

export function BadgeEstado({ estado, className }: BadgeEstadoProps) {
  const estadoNormalizado = typeof estado === "string" ? estado.trim().toLowerCase() : "";
  const estadoConfig =
    estadoNormalizado && estadoNormalizado in config
      ? config[estadoNormalizado as EstadoProyecto]
      : fallback;

  if (process.env.NODE_ENV !== "production" && estadoConfig === fallback) {
    console.warn("[BadgeEstado] Estado no reconocido:", estado);
  }

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium",
        estadoConfig.clase,
        className
      )}
    >
      {estadoConfig.etiqueta}
    </span>
  );
}

