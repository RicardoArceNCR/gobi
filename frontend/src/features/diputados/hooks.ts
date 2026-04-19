import { useQuery } from "@tanstack/react-query";
import { getDiputados, getDiputado, FiltrosDiputado } from "@/services/diputados";

export const diputadosKeys = {
  all: ["diputados"] as const,
  list: (f: FiltrosDiputado) => ["diputados", "list", f] as const,
  detail: (id: string) => ["diputados", "detail", id] as const,
};

export function useDiputados(filtros: FiltrosDiputado = {}) {
  return useQuery({
    queryKey: diputadosKeys.list(filtros),
    queryFn: () => getDiputados(filtros),
    placeholderData: (prev) => prev,
  });
}

export function useDiputado(id: string) {
  return useQuery({
    queryKey: diputadosKeys.detail(id),
    queryFn: () => getDiputado(id),
    enabled: !!id,
  });
}
