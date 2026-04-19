import { api } from "./api";
import { Comision } from "@/types";

export interface FiltrosComision {
  busqueda?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedComisiones {
  items: Comision[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getComisiones(filtros: FiltrosComision = {}): Promise<PaginatedComisiones> {
  const { data } = await api.get("/comisiones", { params: filtros });
  return data;
}

export async function getComision(id: string): Promise<Comision> {
  const { data } = await api.get(`/comisiones/${id}`);
  return data;
}
