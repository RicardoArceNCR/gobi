"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { TEMAS } from "@/data/mock/temas";
import { EstadoProyecto } from "@/types";

const ESTADOS: { value: EstadoProyecto; label: string }[] = [
  { value: "presentado", label: "Presentado" },
  { value: "en_comision", label: "En Comisión" },
  { value: "en_debate", label: "En Debate" },
  { value: "votado", label: "Votado" },
  { value: "aprobado", label: "Aprobado" },
  { value: "archivado", label: "Archivado" },
];

export function FiltrosProyecto() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const handleFilterChange = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [pathname, router, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-white mb-6">
      <div className="flex-1">
        <label htmlFor="q" className="sr-only">Buscar proyectos</label>
        <input 
          id="q"
          type="search" 
          placeholder="Buscar exp, título o palabra..." 
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => handleFilterChange("q", e.target.value)}
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
            <option key={estado.value} value={estado.value}>{estado.label}</option>
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
          {TEMAS.map((tema) => (
            <option key={tema.id} value={tema.slug}>{tema.nombre}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
