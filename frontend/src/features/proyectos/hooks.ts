import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { getProyectos, getProyecto, cambiarEstado } from "@/services/proyectos";
import { getTemas } from "@/services/temas";
import type { FiltrosProyecto } from "@/services/proyectos";

export const proyectosKeys = {
  all: ["proyectos"] as const,
  lists: () => ["proyectos", "list"] as const,
  list: (filtros: FiltrosProyecto) => ["proyectos", "list", filtros] as const,
  detail: (id: string) => ["proyectos", "detail", id] as const,
  temas: ["temas"] as const,
};

export const useProyectos = (filtros: FiltrosProyecto) => {
  return useQuery({
    queryKey: proyectosKeys.list(filtros),
    queryFn: () => getProyectos(filtros),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
};

export const useProyecto = (id: string) => {
  return useQuery({
    queryKey: proyectosKeys.detail(id),
    queryFn: () => getProyecto(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useTemas = () => {
  return useQuery({
    queryKey: proyectosKeys.temas,
    queryFn: getTemas,
    staleTime: 1000 * 60 * 60,
  });
};

export const useCambiarEstado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      estadoNuevo,
      motivo,
    }: {
      id: string;
      estadoNuevo: import("@/types").EstadoProyecto;
      motivo: string;
    }) => cambiarEstado(id, { estadoNuevo, motivo }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: proyectosKeys.detail(variables.id),
      });

      queryClient.invalidateQueries({
        queryKey: proyectosKeys.lists(),
      });
    },
  });
};
