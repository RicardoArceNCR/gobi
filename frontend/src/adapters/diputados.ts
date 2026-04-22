import type { Diputado, Pagina } from "@/types";

export interface BackendPartido {
  id: string;
  nombre: string;
  color_hex: string;
  logo_url?: string;
}

export interface BackendComisionResumen {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

export interface BackendDiputado {
  id: string;
  nombre: string;
  foto_url?: string | null;
  salario: number;
  monto_gasolina: number;
  fecha_inicio: string;
  partido: BackendPartido;
  comisiones: BackendComisionResumen[];
}

export interface BackendPaginaDiputados {
  items: BackendDiputado[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export function adaptDiputado(diputado: BackendDiputado): Diputado {
  return {
    id: diputado.id,
    nombre: diputado.nombre,
    fotoUrl: diputado.foto_url ?? undefined,
    partidoId: diputado.partido.id,
    partido: {
      id: diputado.partido.id,
      nombre: diputado.partido.nombre,
      colorHex: diputado.partido.color_hex,
      logoUrl: diputado.partido.logo_url,
    },
    comisionIds: (diputado.comisiones ?? []).map((c) => c.id),
    comisiones: (diputado.comisiones ?? []).map((c) => ({
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion ?? undefined,
      miembrosCount: 0,
      proyectosCount: 0,
    })),
    salario: diputado.salario,
    montoGasolina: diputado.monto_gasolina,
    fechaInicio: diputado.fecha_inicio,
  };
}

export function adaptPaginaDiputados(data: BackendPaginaDiputados): Pagina<Diputado> {
  return {
    items: data.items.map(adaptDiputado),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    totalPages: data.total_pages,
  };
}
