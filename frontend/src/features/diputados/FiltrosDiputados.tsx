"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { usePartidos } from "./hooks";

export function FiltrosDiputados() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const { data: partidos = [] } = usePartidos();

  const handleFilterChange = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset pagination on filter change
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
    !!searchParams.get("partido");

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-white mb-6 items-center">
      <div className="flex-1 w-full">
        <label htmlFor="busqueda" className="sr-only">Buscar diputados</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            id="busqueda"
            type="search"
            placeholder="Buscar por nombre..."
            defaultValue={searchParams.get("busqueda") ?? ""}
            onChange={(e) => handleFilterChange("busqueda", e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="w-full sm:w-64">
        <label htmlFor="partido" className="sr-only">Filtrar por partido</label>
        <select
          id="partido"
          value={searchParams.get("partido") ?? ""}
          onChange={(e) => handleFilterChange("partido", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los partidos</option>
          {partidos.map((partido) => (
            <option key={partido.id} value={partido.nombre}>
              {partido.nombre}
            </option>
          ))}
        </select>
      </div>

      {hayFiltros && (
        <div className="shrink-0">
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
