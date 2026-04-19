import { useQuery } from "@tanstack/react-query";
import { getComisiones, getComision, FiltrosComision } from "@/services/comisiones";

export const comisionesKeys = {
  all: ["comisiones"] as const,
  list: (f: FiltrosComision) => ["comisiones", "list", f] as const,
  detail: (id: string) => ["comisiones", "detail", id] as const,
};

export function useComisiones(filtros: FiltrosComision = {}) {
  return useQuery({
    queryKey: comisionesKeys.list(filtros),
    queryFn: () => getComisiones(filtros),
    placeholderData: (prev) => prev,
  });
}

export function useComision(id: string) {
  return useQuery({
    queryKey: comisionesKeys.detail(id),
    queryFn: () => getComision(id),
    enabled: !!id,
  });
}
