// frontend/src/services/comisiones.ts
import { api } from "./api";
import { Comision, FiltrosComision } from "@/types/index";

export const getComisiones = async (params?: FiltrosComision): Promise<Comision[]> => {
  const cleanParams: Record<string, string | number> = {};
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanParams[key] = value;
      }
    });
  }

  const { data } = await api.get<Comision[]>("/comisiones", { params: cleanParams });
  return data;
};

export const getComision = async (id: string): Promise<Comision> => {
  const { data } = await api.get<Comision>(`/comisiones/${id}`);
  return data;
};
