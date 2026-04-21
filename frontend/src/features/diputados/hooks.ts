import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getDiputados, getDiputado } from "@/services/diputados";
import { getPartidos } from "@/services/partidos";
import type { FiltrosDiputados } from "@/types";

export const diputadosKeys = {
  all: ["diputados"] as const,
  lists: () => ["diputados", "list"] as const,
  list: (params: FiltrosDiputados = {}) => ["diputados", "list", params] as const,
  detail: (id: string) => ["diputados", "detail", id] as const,
  partidos: ["partidos"] as const,
};

export const useDiputados = (params: FiltrosDiputados = {}) => {
  return useQuery({
    queryKey: diputadosKeys.list(params),
    queryFn: () => getDiputados(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
};

export const useDiputado = (id: string) => {
  return useQuery({
    queryKey: diputadosKeys.detail(id),
    queryFn: () => getDiputado(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const usePartidos = () => {
  return useQuery({
    queryKey: diputadosKeys.partidos,
    queryFn: getPartidos,
    staleTime: 1000 * 60 * 60,
  });
};
