// /src/components/ui/TablaVotos.tsx
import { Voto } from "@/types";

const config = {
  a_favor:    { clase: "bg-green-100 text-green-800",   etiqueta: "A favor"    },
  en_contra:  { clase: "bg-red-100 text-red-800",       etiqueta: "En contra"  },
  abstencion: { clase: "bg-yellow-100 text-yellow-800", etiqueta: "Abstención" },
  ausente:    { clase: "bg-gray-100 text-gray-500",     etiqueta: "Ausente"    },
};

const fallback = { clase: "bg-zinc-100 text-zinc-600", etiqueta: "Desconocido" };

export function TablaVotos({ votos }: { votos: Voto[] }) {
  if (!votos.length) return null;

  const resumen = votos.reduce((acc, v) => {
    acc[v.valor] = (acc[v.valor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        {Object.entries(resumen).map(([valor, total]) => {
          const configItem = valor in config ? config[valor as keyof typeof config] : fallback;
          return (
            <div
              key={valor}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${configItem.clase}`}
            >
              {configItem.etiqueta}: {total}
            </div>
          );
        })}
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Diputado/a</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Partido</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Voto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {votos.map((v) => {
              const configItem = v.valor in config ? config[v.valor as keyof typeof config] : fallback;
              return (
                <tr key={v.diputadoId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{v.diputadoNombre}</td>
                  <td className="px-4 py-3 text-gray-500">{v.partido}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${configItem.clase}`}>
                      {configItem.etiqueta}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
