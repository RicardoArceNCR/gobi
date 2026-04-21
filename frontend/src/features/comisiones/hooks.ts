import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getComisiones, getComision } from "@/services/comisiones";
import type { FiltrosComision } from "@/types";

export const comisionesKeys = {
  all: ["comisiones"] as const,
  lists: () => ["comisiones", "list"] as const,
  list: (filtros: FiltrosComision = {}) => ["comisiones", "list", filtros] as const,
  detail: (id: string) => ["comisiones", "detail", id] as const,
};

export function useComisiones(filtros: FiltrosComision = {}) {
  return useQuery({
    queryKey: comisionesKeys.list(filtros),
    queryFn: () => getComisiones(filtros),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
}

export function useComision(id: string) {
  return useQuery({
    queryKey: comisionesKeys.detail(id),
    queryFn: () => getComision(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
