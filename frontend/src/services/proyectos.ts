import { api } from "./api";
import { limpiarParams } from "@/lib/http";
import { 
  BackendProyecto, 
  BackendPaginaProyectos, 
  adaptProyecto, 
  adaptPaginaProyectos 
} from "@/adapters/proyectos";
import { ProyectoLey, EstadoProyecto, Pagina } from "@/types/index";

export interface FiltrosProyecto {
  estado?: EstadoProyecto | string;
  tema?: string;
  partido?: string;
  busqueda?: string;
  page?: number;
}

export const getProyectos = async (filtros?: FiltrosProyecto): Promise<Pagina<ProyectoLey>> => {
  const cleanParams = filtros ? limpiarParams(filtros as unknown as Record<string, unknown>) : {};

  const { data } = await api.get<BackendPaginaProyectos>("/proyectos", { 
    params: cleanParams 
  });

  return adaptPaginaProyectos(data);
};

export const getProyecto = async (id: string): Promise<ProyectoLey> => {
  const { data } = await api.get<BackendProyecto>(`/proyectos/${id}`);
  return adaptProyecto(data);
};

export const cambiarEstado = async (
  id: string,
  payload: { estadoNuevo: EstadoProyecto; motivo: string }
): Promise<ProyectoLey> => {
  const { data } = await api.patch<BackendProyecto>(`/proyectos/${id}/estado`, {
    estado_nuevo: payload.estadoNuevo,
    motivo: payload.motivo,
  });

  return adaptProyecto(data);
};
