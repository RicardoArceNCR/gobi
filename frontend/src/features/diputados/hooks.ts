// frontend/src/features/diputados/hooks.ts
import { useQuery } from "@tanstack/react-query";
import { getDiputados, getDiputado } from "@/services/diputados";
import type { FiltrosDiputados } from "@/types/index";

export const diputadosKeys = {
  all: ["diputados"] as const,
  list: (params?: FiltrosDiputados) => ["diputados", "list", params] as const,
  detail: (id: string) => ["diputados", "detail", id] as const,
};

export const useDiputados = (params?: FiltrosDiputados) => {
  return useQuery({
    queryKey: diputadosKeys.list(params),
    queryFn: () => getDiputados(params),
  });
};


export const useDiputado = (id: string) => {
  return useQuery({
    queryKey: diputadosKeys.detail(id),
    queryFn: () => getDiputado(id),
    enabled: !!id,
  });
};
