// frontend/src/features/proyectos/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProyectos, getProyecto, cambiarEstado } from "@/services/proyectos";
import type { FiltrosProyecto } from "@/services/proyectos";

export const proyectosKeys = {
  all: ["proyectos"] as const,
  list: (filtros: FiltrosProyecto) => ["proyectos", "list", filtros] as const,
  detail: (id: string) => ["proyectos", "detail", id] as const,
};

export const useProyectos = (filtros: FiltrosProyecto) => {
  return useQuery({
    queryKey: proyectosKeys.list(filtros),
    queryFn: () => getProyectos(filtros),
  });
};

export const useProyecto = (id: string) => {
  return useQuery({
    queryKey: proyectosKeys.detail(id),
    queryFn: () => getProyecto(id),
    enabled: !!id,
  });
};

export const useCambiarEstado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => cambiarEstado(id, estado),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: proyectosKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: proyectosKeys.all });
    },
  });
};
