import Link from "next/link";
import { cn, formatearFecha } from "@/lib/utils";
import { ProyectoLey } from "@/types";
import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { BadgePrioridad } from "@/components/ui/BadgePrioridad";

interface Props {
  proyecto: ProyectoLey;
  className?: string;
}

export function ProyectoCard({ proyecto, className }: Props) {
  return (
    <Link 
      href={`/proyectos/${proyecto.id}`}
      className={cn("block border rounded-xl p-4 bg-white hover:shadow-md transition", className)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-2 flex-wrap text-xs text-gray-500 items-center">
            <span className="font-medium text-gray-700">Exp. {proyecto.codigo}</span>
            <span>•</span>
            <span>{formatearFecha(proyecto.fechaPresentacion)}</span>
          </div>
          {proyecto.prioridad && (
            <BadgePrioridad prioridad={proyecto.prioridad} />
          )}
        </div>
        
        <h3 className="font-semibold text-gray-900 line-clamp-2">
          {proyecto.titulo}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2">
          {proyecto.descripcion}
        </p>

        <div className="flex justify-between items-center mt-1">
          <BadgeEstado estado={proyecto.estado} />
          <div className="flex gap-1 flex-wrap justify-end">
            {proyecto.temas.slice(0, 2).map((tema) => (
              <span 
                key={tema.id} 
                className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium"
              >
                {tema.nombre}
              </span>
            ))}
            {proyecto.temas.length > 2 && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium">
                +{proyecto.temas.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
