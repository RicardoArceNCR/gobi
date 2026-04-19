import { PROYECTOS_BY_ID } from "@/data/mock/proyectos";
import { EmptyState } from "@/components/ui/EmptyState";
import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { BadgePrioridad } from "@/components/ui/BadgePrioridad";
import { formatearFecha } from "@/lib/utils";
import { TimelineLegislativa } from "@/components/ui/TimelineLegislativa";
import { TablaVotos } from "@/components/ui/TablaVotos";
import { Metadata } from "next";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const proyecto = PROYECTOS_BY_ID[params.id];
  return {
    title: proyecto ? `${proyecto.codigo} | GOBi` : "Proyecto no encontrado | GOBi",
  };
}

export default function ProyectoDetailPage({ params }: { params: { id: string } }) {
  const proyecto = PROYECTOS_BY_ID[params.id];

  if (!proyecto) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icono="⚠️"
          titulo="Proyecto no encontrado"
          descripcion="El expediente solicitado no existe o fue removido."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      {/* Header Info */}
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
            <span className="font-medium text-gray-900">{proyecto.comisionNombre}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Texto Resumen</h2>
            <div className="bg-white p-6 rounded-xl border text-gray-700 leading-relaxed shadow-sm">
              {proyecto.textoCompleto || "El texto completo del proyecto no está disponible."}
            </div>
          </section>

          {proyecto.votos.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">Votación en Plenario</h2>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <TablaVotos votos={proyecto.votos} />
              </div>
            </section>
          )}
        </div>

        <div className="space-y-10">
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-5">Historial Legislativo</h3>
            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <TimelineLegislativa historial={proyecto.historial} />
            </div>
          </section>
          
          {proyecto.documentos.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-5">Documentos Adjuntos</h3>
              <ul className="space-y-3">
                {proyecto.documentos.map((doc) => (
                  <li key={doc.id}>
                    <a 
                      href={doc.url} 
                      className="flex items-start gap-3 p-4 bg-white border rounded-xl hover:shadow-md hover:border-blue-200 transition group"
                    >
                      <span className="text-2xl grayscale group-hover:grayscale-0 transition">{doc.tipo === "pdf" ? "📄" : "🔗"}</span>
                      <div>
                        <span className="font-medium text-blue-600 line-clamp-1 group-hover:underline">{doc.nombre}</span>
                        <span className="text-xs text-gray-500">{formatearFecha(doc.fechaSubida)}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
