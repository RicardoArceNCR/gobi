import { api } from "./api";
import { ProyectoLey, EstadoProyecto } from "@/types";

export interface FiltrosProyecto {
  estado?: EstadoProyecto | "todos" | "";
  busqueda?: string;
  tema?: string;
  partido?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedProyectos {
  items: ProyectoLey[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getProyectos(filtros: FiltrosProyecto = {}): Promise<PaginatedProyectos> {
  // Limpiar parámetros vacíos para no enviarlos al backend
  const params: any = { ...filtros };
  if (params.estado === "todos" || params.estado === "") {
    delete params.estado;
  }
  
  const { data } = await api.get("/proyectos", { params });
  return data;
}

export async function getProyecto(id: string): Promise<ProyectoLey> {
  const { data } = await api.get(`/proyectos/${id}`);
  return data;
}
