// frontend/src/services/proyectos.ts
import { api } from "./api";
import { ProyectoLey, EstadoProyecto } from "@/types/index";

export interface FiltrosProyecto {
  estado?: EstadoProyecto | string;
  tema?: string;
  busqueda?: string;
  page?: number;
}

export interface PaginaProyectos {
  items: ProyectoLey[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const getProyectos = async (filtros?: FiltrosProyecto): Promise<PaginaProyectos> => {
  const params: Record<string, string | number> = {};
  
  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      // Limpia params vacíos
      if (value !== undefined && value !== null && value !== "") {
        params[key] = value;
      }
    });
  }

  const { data } = await api.get<PaginaProyectos>("/proyectos", { params });
  return data;
};

export const getProyecto = async (id: string): Promise<ProyectoLey> => {
  const { data } = await api.get<ProyectoLey>(`/proyectos/${id}`);
  return data;
};

export const cambiarEstado = async (id: string, estado: string) => {
  const { data } = await api.patch(`/proyectos/${id}/estado`, { estado });
  return data;
};

