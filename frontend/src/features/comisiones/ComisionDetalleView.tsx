"use client";

import { useComision } from "./hooks";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import Image from "next/image";

export function ComisionDetalleView({ id }: { id: string }) {
  const { data: comision, isLoading, isError } = useComision(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse max-w-6xl">
        <div className="h-10 w-1/3 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-8" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-64 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !comision) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icono="⚠️"
          titulo="Comisión no encontrada"
          descripcion="La comisión solicitada no existe o hubo un error al comunicarse con el servidor."
          accion={
            <Link
              href="/comisiones"
              className="inline-flex px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
            >
              Volver a comisiones
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="mb-8 border-b pb-8">
        <nav className="mb-4">
          <Link href="/comisiones" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            ← Volver a comisiones
          </Link>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{comision.nombre}</h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
          {comision.descripcion || "Sin descripción disponible."}
        </p>

        <div className="flex gap-8 mt-6">
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <span className="block text-xs uppercase font-bold text-blue-400">Miembros</span>
            <span className="text-xl font-bold text-blue-700">{comision.miembros?.length ?? 0}</span>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
            <span className="block text-xs uppercase font-bold text-green-400">Proyectos</span>
            <span className="text-xl font-bold text-green-700">{comision.proyectosCount ?? comision.proyectos?.length ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Miembros */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Miembros</h2>
          {comision.miembros && comision.miembros.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {comision.miembros.map((diputado) => (
                <Link
                  key={diputado.id}
                  href={`/diputados/${diputado.id}`}
                  className="flex items-center gap-4 p-3 border rounded-xl hover:shadow-md hover:border-blue-200 transition bg-white group"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border">
                    {diputado.fotoUrl ? (
                      <Image
                        src={diputado.fotoUrl}
                        alt={diputado.nombre}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                      {diputado.nombre}
                    </div>
                    <div className="text-xs flex items-center gap-2">
                       <span 
                         className="w-2 h-2 rounded-full" 
                         style={{ backgroundColor: diputado.partido?.colorHex || "#9ca3af" }} 
                       />
                      {diputado.partido?.nombre || "Sin partido"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed rounded-xl text-center text-gray-500">
              No hay miembros asignados a esta comisión.
            </div>
          )}
        </section>

        {/* Proyectos */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Proyectos en estudio</h2>
          {comision.proyectos && comision.proyectos.length > 0 ? (
            <div className="space-y-4">
              {comision.proyectos.map((proyecto) => (
                <Link
                  key={proyecto.id}
                  href={`/proyectos/${proyecto.id}`}
                  className="block p-4 border rounded-xl hover:shadow-md hover:border-blue-200 transition bg-white group"
                >
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">
                    Exp. {proyecto.codigo}
                  </div>
                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                    {proyecto.titulo}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed rounded-xl text-center text-gray-500">
              No hay proyectos activos en esta comisión.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
