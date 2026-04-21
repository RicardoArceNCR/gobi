import { api } from "./api";
import { limpiarParams } from "@/lib/http";
import { 
  BackendDiputado, 
  BackendPaginaDiputados, 
  adaptDiputado, 
  adaptPaginaDiputados 
} from "@/adapters/diputados";
import { Diputado, FiltrosDiputados, Pagina } from "@/types/index";

export const getDiputados = async (params?: FiltrosDiputados): Promise<Pagina<Diputado>> => {
  const cleanParams = params ? limpiarParams(params as unknown as Record<string, unknown>) : {};

  const { data } = await api.get<BackendPaginaDiputados>("/diputados", {
    params: cleanParams,
  });

  return adaptPaginaDiputados(data);
};

export const getDiputado = async (id: string): Promise<Diputado> => {
  const { data } = await api.get<BackendDiputado>(`/diputados/${id}`);
  return adaptDiputado(data);
};
