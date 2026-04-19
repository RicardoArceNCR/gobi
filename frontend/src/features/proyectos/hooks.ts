import { useQuery } from "@tanstack/react-query";
import { getProyectos, getProyecto, FiltrosProyecto } from "@/services/proyectos";

export const proyectosKeys = {
  all: ["proyectos"] as const,
  list: (f: FiltrosProyecto) => ["proyectos", "list", f] as const,
  detail: (id: string) => ["proyectos", "detail", id] as const,
};

export function useProyectos(filtros: FiltrosProyecto = {}) {
  return useQuery({
    queryKey: proyectosKeys.list(filtros),
    queryFn: () => getProyectos(filtros),
    placeholderData: (prev) => prev, // Maintains previous data while paginating
  });
}

export function useProyecto(id: string) {
  return useQuery({
    queryKey: proyectosKeys.detail(id),
    queryFn: () => getProyecto(id),
    enabled: !!id,
  });
}
