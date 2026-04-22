import type { Comision, Diputado, Pagina } from "@/types";
import { BackendPartido } from "./diputados";

export interface BackendDiputadoResumen {
  id: string;
  nombre: string;
  foto_url?: string | null;
  partido: BackendPartido;
}

export interface BackendProyectoBrief {
  id: string;
  codigo: string;
  titulo: string;
}

export interface BackendComisionResumen {
  id: string;
  nombre: string;
  descripcion?: string | null;
  miembros_count?: number;
  proyectos_count?: number;
}

export interface BackendComisionDetalle extends BackendComisionResumen {
  miembros: BackendDiputadoResumen[];
  proyectos: BackendProyectoBrief[];
}

export interface BackendPaginaComisiones {
  items: BackendComisionResumen[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

function adaptDiputadoResumen(dr: BackendDiputadoResumen): Diputado {
  return {
    id: dr.id,
    nombre: dr.nombre,
    fotoUrl: dr.foto_url ?? undefined,
    partidoId: dr.partido.id,
    partido: {
      id: dr.partido.id,
      nombre: dr.partido.nombre,
      colorHex: dr.partido.color_hex,
      logoUrl: dr.partido.logo_url,
    },
    comisionIds: [],
    salario: undefined,
    montoGasolina: undefined,
    fechaInicio: undefined,
  };
}

export function adaptComisionResumen(comision: BackendComisionResumen): Comision {
  return {
    id: comision.id,
    nombre: comision.nombre,
    descripcion: comision.descripcion ?? undefined,
    miembros: undefined,
    miembrosCount: comision.miembros_count ?? 0,
    proyectosCount: comision.proyectos_count ?? 0,
  };
}

export function adaptComisionDetalle(comision: BackendComisionDetalle): Comision {
  return {
    id: comision.id,
    nombre: comision.nombre,
    descripcion: comision.descripcion ?? undefined,
    miembros: (comision.miembros ?? []).map(adaptDiputadoResumen),
    miembrosCount: (comision.miembros ?? []).length,
    proyectosCount: (comision.proyectos ?? []).length,
    proyectos: (comision.proyectos ?? []).map((p) => ({
      id: p.id,
      codigo: p.codigo,
      titulo: p.titulo,
    })),
  };
}

export function adaptPaginaComisiones(data: BackendPaginaComisiones): Pagina<Comision> {
  return {
    items: data.items.map(adaptComisionResumen),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    totalPages: data.total_pages,
  };
}
