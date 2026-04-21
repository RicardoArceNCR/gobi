"use client";

import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { BadgePrioridad } from "@/components/ui/BadgePrioridad";
import { formatearFecha } from "@/lib/utils";
import type { ProyectoLey } from "@/types";

interface Props {
  proyecto: ProyectoLey;
}

export function ProyectoHeader({ proyecto }: Props) {
  return (
    <div className="mb-8 border-b pb-8">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <BadgeEstado estado={proyecto.estado} />
        {proyecto.prioridad && <BadgePrioridad prioridad={proyecto.prioridad} />}
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border">
          Exp. {proyecto.codigo}
        </span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {proyecto.titulo}
      </h1>
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        {proyecto.descripcion}
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white border rounded-xl shadow-sm">
        <div>
          <span className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Comisión</span>
          <span className="font-medium text-gray-900">{proyecto.comisionNombre || "Sin asignar"}</span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Proponente</span>
          <span className="font-medium text-gray-900">{proyecto.proponente.nombre}</span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Presentación</span>
          <span className="font-medium text-gray-900">{formatearFecha(proyecto.fechaPresentacion)}</span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Último Cambio</span>
          <span className="font-medium text-gray-900">{formatearFecha(proyecto.fechaUltimoCambio)}</span>
        </div>
      </div>
    </div>
  );
}
