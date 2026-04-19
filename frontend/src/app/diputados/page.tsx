import { DIPUTADOS } from "@/data/mock/diputados";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diputados | GOBi",
};

export default function DiputadosPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Directorio Legislativo</h1>
        <p className="text-gray-500">
          Conoce a las diputaciones de la Asamblea Legislativa actual, sus comisiones y partidos políticos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {DIPUTADOS.map((diputado) => (
          <div key={diputado.id} className="border rounded-xl p-5 bg-white hover:shadow-md transition flex flex-col items-center text-center">
            {/* Foto Placeholder */}
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl mb-4 text-white shadow-sm ring-4 ring-offset-2 ring-gray-50"
              style={{ backgroundColor: diputado.partido.colorHex }}
            >
              {diputado.nombre.charAt(0)}
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-1">{diputado.nombre}</h3>
            
            <div className="flex items-center gap-1.5 justify-center mb-4">
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: diputado.partido.colorHex }} 
              />
              <span className="text-xs text-gray-500 font-medium">
                {diputado.partido.nombre}
              </span>
            </div>

            <div className="mt-auto w-full border-t pt-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Comisiones</span>
              <div className="text-xs text-gray-600 mt-1 font-medium">{diputado.comisionIds.length} Asignadas</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
