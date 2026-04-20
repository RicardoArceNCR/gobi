import { api } from "./api";
import { Diputado, FiltrosDiputados } from "@/types/index";

export const getDiputados = async (params?: FiltrosDiputados): Promise<Diputado[]> => {
  const cleanParams: Record<string, string | number> = {};
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanParams[key] = value;
      }
    });
  }

  const { data } = await api.get<Diputado[]>("/diputados", { params: cleanParams });
  return data;
};

export const getDiputado = async (id: string): Promise<Diputado> => {
  const { data } = await api.get<Diputado>(`/diputados/${id}`);
  return data;
};
