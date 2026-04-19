import { api } from "./api";
import { Diputado } from "@/types";

export interface FiltrosDiputado {
  partido?: string;
  busqueda?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedDiputados {
  items: Diputado[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getDiputados(filtros: FiltrosDiputado = {}): Promise<PaginatedDiputados> {
  const { data } = await api.get("/diputados", { params: filtros });
  return data;
}

export async function getDiputado(id: string): Promise<Diputado> {
  const { data } = await api.get(`/diputados/${id}`);
  return data;
}
