"use client";

import { useProyecto } from "./hooks";
import { EmptyState } from "@/components/ui/EmptyState";
import { TimelineLegislativa } from "@/components/ui/TimelineLegislativa";
import { TablaVotos } from "@/components/ui/TablaVotos";
import { ProyectoHeader } from "./ProyectoHeader";
import { ProyectoDocumentos } from "./ProyectoDocumentos";

export function ProyectoDetalleView({ id }: { id: string }) {
  const { data: proyecto, isLoading, isError } = useProyecto(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse max-w-6xl">
        <div className="h-6 w-24 bg-gray-200 rounded-full mb-4" />
        <div className="h-10 w-3/4 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-8" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 border rounded-xl mb-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 h-64 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !proyecto) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icono="⚠️"
          titulo="Proyecto no encontrado"
          descripcion="El expediente solicitado no existe o hubo un error al comunicarse con el servidor."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <ProyectoHeader proyecto={proyecto} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Texto completo</h2>
            <div className="bg-white p-6 rounded-xl border text-gray-700 leading-relaxed shadow-sm">
              {proyecto.textoCompleto || "El texto completo del proyecto no está disponible."}
            </div>
          </section>

          {proyecto.votos && proyecto.votos.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">Votación en Plenario</h2>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <TablaVotos votos={proyecto.votos} />
              </div>
            </section>
          )}
        </div>

        <div className="space-y-10">
          {proyecto.historial && proyecto.historial.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-5">Historial Legislativo</h3>
              <div className="bg-white p-5 rounded-xl border shadow-sm">
                <TimelineLegislativa historial={proyecto.historial} />
              </div>
            </section>
          )}
          
          <ProyectoDocumentos documentos={proyecto.documentos || []} />
        </div>
      </div>
    </div>
  );
}
