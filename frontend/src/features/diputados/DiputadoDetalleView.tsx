"use client";

import { useDiputado } from "./hooks";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatearFecha, formatearMoneda } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export function DiputadoDetalleView({ id }: { id: string }) {
  const { data: diputado, isLoading, isError } = useDiputado(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="w-48 h-48 bg-gray-200 rounded-2xl mx-auto md:mx-0" />
          <div className="flex-1 space-y-4">
             <div className="h-10 w-1/2 bg-gray-200 rounded" />
             <div className="h-6 w-1/4 bg-gray-200 rounded" />
             <div className="h-20 w-full bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !diputado) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icono="👤"
          titulo="Diputado no encontrado"
          descripcion="El perfil solicitado no existe o hubo un error al comunicarse con el servidor."
          accion={
            <Link
              href="/diputados"
              className="inline-flex px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
            >
              Volver al directorio
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link href="/diputados" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          ← Volver al directorio
        </Link>
      </nav>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden mb-10">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700" />
        <div className="px-8 pb-8 -mt-16 flex flex-col md:flex-row gap-8 items-start">
          <div className="relative">
            <div 
              className="w-40 h-40 rounded-2xl bg-white p-1 shadow-xl ring-4 ring-white"
            >
               {diputado.fotoUrl ? (
                 <Image
                   src={diputado.fotoUrl}
                   alt={diputado.nombre}
                   width={160}
                   height={160}
                   className="w-full h-full object-cover rounded-xl"
                 />
               ) : (
                 <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-5xl">👤</div>
               )}
            </div>
            <div 
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-4 border-white shadow-lg"
              style={{ backgroundColor: diputado.partido?.colorHex || "#9ca3af" }}
              title={diputado.partido?.nombre || "Sin partido"}
            />
          </div>

          <div className="flex-1 pt-16 md:pt-20">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{diputado.nombre}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
               <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium border">
                 <span 
                   className="w-2.5 h-2.5 rounded-full" 
                   style={{ backgroundColor: diputado.partido?.colorHex || "#9ca3af" }} 
                 />
                 {diputado.partido?.nombre || "Sin partido"}
               </span>
               <span className="text-sm">En el cargo desde {diputado.fechaInicio ? formatearFecha(diputado.fechaInicio) : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Finances & Info */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>💰</span> Compensaciones
            </h2>
            <div className="space-y-6">
              <div>
                <span className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Salario Mensual</span>
                <span className="text-2xl font-bold text-gray-900">{formatearMoneda(diputado.salario || 0)}</span>
              </div>
              <div>
                <span className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Cuota de Gasolina</span>
                <span className="text-2xl font-bold text-gray-900">{formatearMoneda(diputado.montoGasolina || 0)}</span>
                <p className="text-[10px] text-gray-400 mt-1 italic">* Monto máximo establecido por ley.</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border shadow-sm">
             <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📊</span> Actividad
            </h2>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                   <span className="block text-2xl font-bold text-gray-900">—</span>
                   <span className="text-[10px] uppercase font-bold text-gray-400">Proyectos</span>
                   <p className="text-[10px] text-gray-400 mt-1">Pendiente de integrar</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                   <span className="block text-2xl font-bold text-gray-900">{diputado.comisionIds?.length || 0}</span>
                   <span className="text-[10px] uppercase font-bold text-gray-400">Comisiones</span>
                </div>
             </div>
          </section>
        </div>

        {/* Right Column: Commissions */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comisiones que integra</h2>
            {diputado.comisiones && diputado.comisiones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diputado.comisiones.map((comision) => (
                  <Link
                    key={comision.id}
                    href={`/comisiones/${comision.id}`}
                    className="p-5 bg-white border rounded-2xl hover:shadow-md hover:border-blue-200 transition group flex flex-col justify-center"
                  >
                    <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                      {comision.nombre}
                    </span>
                    {comision.descripcion && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {comision.descripcion}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 border-2 border-dashed rounded-3xl text-center text-gray-400 bg-white">
                Este diputado no tiene comisiones asignadas actualmente.
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Proyectos propuestos</h2>
             <div className="p-12 border-2 border-dashed rounded-3xl text-center text-gray-400 bg-white">
                Próximamente: Historial completo de iniciativas legislativas.
              </div>
          </section>
        </div>
      </div>
    </div>
  );
}
