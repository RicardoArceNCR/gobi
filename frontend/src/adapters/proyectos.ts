import type { Pagina, ProyectoLey, EstadoProyecto, ValorVoto } from "@/types";
import { BackendTema, adaptTema } from "./temas";
import { BackendPartido } from "./diputados";

export interface BackendCambioEstado {
  id: string;
  estado_anterior: EstadoProyecto;
  estado_nuevo: EstadoProyecto;
  motivo: string;
  usuario_nombre: string;
  created_at: string;
}

export interface BackendDocumento {
  id: string;
  nombre: string;
  url: string;
  tipo: string;
  created_at?: string | null;
}

export interface BackendVoto {
  diputado_id: string;
  diputado_nombre?: string | null;
  partido?: string | null;
  valor: ValorVoto;
  diputado?: {
    nombre?: string | null;
    partido?: {
      nombre?: string | null;
    } | null;
  } | null;
}

export interface BackendDiputadoResumen {
  id: string;
  nombre: string;
  partido?: BackendPartido | null;
}

export interface BackendComisionResumen {
  id: string;
  nombre: string;
}

export interface BackendProyecto {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  texto_completo?: string | null;
  estado: EstadoProyecto;
  fecha_presentacion: string;
  fecha_ultimo_cambio?: string | null;
  proponente: BackendDiputadoResumen;
  temas: BackendTema[];
  comision?: BackendComisionResumen | null;
  comision_nombre?: string | null;
  historial?: BackendCambioEstado[] | null;
  documentos?: BackendDocumento[] | null;
  votos?: BackendVoto[] | null;
  updated_at?: string | null;
}

export interface BackendPaginaProyectos {
  items: BackendProyecto[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export function adaptProyecto(proyecto: BackendProyecto): ProyectoLey {
  return {
    id: proyecto.id,
    codigo: proyecto.codigo,
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    textoCompleto: proyecto.texto_completo ?? undefined,
    estado: proyecto.estado,
    fechaPresentacion: proyecto.fecha_presentacion,
    fechaUltimoCambio: proyecto.fecha_ultimo_cambio ?? undefined,
    proponente: {
      id: proyecto.proponente.id,
      nombre: proyecto.proponente.nombre,
      fotoUrl: undefined,
      partidoId: proyecto.proponente.partido?.id ?? undefined,
      partido: proyecto.proponente.partido
        ? {
            id: proyecto.proponente.partido.id,
            nombre: proyecto.proponente.partido.nombre,
            colorHex: proyecto.proponente.partido.color_hex ?? "#9ca3af",
            logoUrl: proyecto.proponente.partido.logo_url,
          }
        : undefined,
    },
    comisionId: proyecto.comision?.id ?? undefined,
    comisionNombre: proyecto.comision_nombre ?? proyecto.comision?.nombre ?? undefined,
    temas: (proyecto.temas ?? []).map(adaptTema),
    historial: (proyecto.historial ?? []).map((entrada) => ({
      id: entrada.id,
      estadoAnterior: entrada.estado_anterior,
      estadoNuevo: entrada.estado_nuevo,
      motivo: entrada.motivo,
      fecha: entrada.created_at,
      usuarioNombre: entrada.usuario_nombre,
    })),
    documentos: (proyecto.documentos ?? []).map((doc) => ({
      id: doc.id,
      nombre: doc.nombre,
      url: doc.url,
      tipo: ["pdf", "audio", "video"].includes(doc.tipo)
        ? (doc.tipo as "pdf" | "audio" | "video")
        : "pdf",
      fechaSubida: doc.created_at ?? undefined,
    })),
    votos: (proyecto.votos ?? []).map((voto) => ({
      diputadoId: voto.diputado_id,
      diputadoNombre: voto.diputado_nombre ?? voto.diputado?.nombre ?? undefined,
      partido: voto.partido ?? voto.diputado?.partido?.nombre ?? undefined,
      valor: voto.valor,
    })),
    prioridad: undefined,
  };
}

export function adaptPaginaProyectos(data: BackendPaginaProyectos): Pagina<ProyectoLey> {
  return {
    items: data.items.map(adaptProyecto),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    totalPages: data.total_pages,
  };
}
