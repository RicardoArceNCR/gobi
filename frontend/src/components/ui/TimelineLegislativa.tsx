// /src/components/ui/TimelineLegislativa.tsx
import { CambioEstado } from "@/types";
import { BadgeEstado } from "./BadgeEstado";
import { formatearFecha } from "@/lib/utils";

export function TimelineLegislativa({ historial }: { historial: CambioEstado[] }) {
  if (!historial.length) return null;

  return (
    <div className="relative pl-6 space-y-6">
      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
      {historial.map((entrada) => (
        <div key={entrada.id} className="relative flex gap-4">
          <div className="absolute -left-[18px] w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white mt-1.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <BadgeEstado estado={entrada.estadoNuevo} />
              <span className="text-xs text-gray-400">{formatearFecha(entrada.fecha)}</span>
            </div>
            <p className="text-sm text-gray-600">{entrada.motivo}</p>
            <p className="text-xs text-gray-400 mt-0.5">por {entrada.usuarioNombre || "Sistema"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
