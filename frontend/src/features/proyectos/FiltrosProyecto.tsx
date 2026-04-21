"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { EstadoProyecto } from "@/types";
import { useTemas } from "./hooks";

const ESTADOS: { value: EstadoProyecto; label: string }[] = [
  { value: "presentado", label: "Presentado" },
  { value: "en_comision", label: "En Comisión" },
  { value: "en_debate", label: "En Debate" },
  { value: "votado", label: "Votado" },
  { value: "aprobado", label: "Aprobado" },
  { value: "archivado", label: "Archivado" },
];

const PARTIDOS = [
  "Liberales Unidos",
  "Frente Social Verde",
];

export function FiltrosProyecto() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const { data: temas = [] } = useTemas();

  const handleFilterChange = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }, [pathname, router, searchParams]);

  const limpiarFiltros = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [pathname, router]);

  const hayFiltros =
    !!searchParams.get("busqueda") ||
    !!searchParams.get("estado") ||
    !!searchParams.get("tema") ||
    !!searchParams.get("partido");

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 border rounded-xl bg-white mb-6">
      <div className="flex-1">
        <label htmlFor="busqueda" className="sr-only">Buscar proyectos</label>
        <input
          id="busqueda"
          type="search"
          placeholder="Buscar expediente, título o palabra..."
          defaultValue={searchParams.get("busqueda") ?? ""}
          onChange={(e) => handleFilterChange("busqueda", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="sm:w-48">
        <label htmlFor="estado" className="sr-only">Estado</label>
        <select
          id="estado"
          value={searchParams.get("estado") ?? ""}
          onChange={(e) => handleFilterChange("estado", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-56">
        <label htmlFor="tema" className="sr-only">Tema</label>
        <select
          id="tema"
          value={searchParams.get("tema") ?? ""}
          onChange={(e) => handleFilterChange("tema", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los temas</option>
          {temas.map((tema) => (
            <option key={tema.id} value={tema.slug}>
              {tema.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-56">
        <label htmlFor="partido" className="sr-only">Partido</label>
        <select
          id="partido"
          value={searchParams.get("partido") ?? ""}
          onChange={(e) => handleFilterChange("partido", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los partidos</option>
          {PARTIDOS.map((partido) => (
            <option key={partido} value={partido}>
              {partido}
            </option>
          ))}
        </select>
      </div>

      {hayFiltros && (
        <div className="flex items-center">
          <button
            onClick={limpiarFiltros}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
