import { api } from "./api";
import { limpiarParams } from "@/lib/http";
import { 
  BackendComisionDetalle, 
  BackendPaginaComisiones, 
  adaptComisionDetalle, 
  adaptPaginaComisiones 
} from "@/adapters/comisiones";
import { Comision, FiltrosComision, Pagina } from "@/types/index";

export const getComisiones = async (params?: FiltrosComision): Promise<Pagina<Comision>> => {
  const cleanParams = params ? limpiarParams(params as unknown as Record<string, unknown>) : {};

  const { data } = await api.get<BackendPaginaComisiones>("/comisiones", {
    params: cleanParams,
  });

  return adaptPaginaComisiones(data);
};

export const getComision = async (id: string): Promise<Comision> => {
  const { data } = await api.get<BackendComisionDetalle>(`/comisiones/${id}`);
  return adaptComisionDetalle(data);
};
