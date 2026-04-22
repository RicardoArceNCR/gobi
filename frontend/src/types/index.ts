// /src/types/index.ts

export type EstadoProyecto =
  | "presentado"
  | "en_comision"
  | "en_debate"
  | "votado"
  | "aprobado"
  | "archivado";

export type PrioridadFeed = "urgente" | "en_debate" | "actualizado" | "seguido";

export type RolUsuario = "ciudadano" | "diputado" | "admin";

export type ValorVoto = "a_favor" | "en_contra" | "abstencion" | "ausente";

export interface Pagina<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Tema {
  id: string;
  nombre: string;
  slug: string;
  colorHex: string;
}

export interface Partido {
  id: string;
  nombre: string;
  colorHex: string;
  logoUrl?: string;
}

export interface DiputadoResumen {
  id: string;
  nombre: string;
  fotoUrl?: string;
  partidoId?: string;
  partido?: Partido;
}

export interface Diputado extends DiputadoResumen {
  comisionIds: string[];
  comisiones?: Comision[];
  salario?: number;
  montoGasolina?: number;
  fechaInicio?: string;
}

export interface CambioEstado {
  id: string;
  estadoAnterior: EstadoProyecto;
  estadoNuevo: EstadoProyecto;
  motivo: string;
  fecha: string;
  usuarioNombre: string;
}

export interface Documento {
  id: string;
  nombre: string;
  url: string;
  tipo: "pdf" | "audio" | "video";
  fechaSubida?: string;
}

export interface Voto {
  diputadoId: string;
  diputadoNombre?: string;
  partido?: string;
  valor: ValorVoto;
}

export interface ProyectoLey {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  textoCompleto?: string;
  estado: EstadoProyecto;
  fechaPresentacion: string;
  fechaUltimoCambio?: string;
  proponente: DiputadoResumen;
  comisionId?: string;
  comisionNombre?: string;
  temas: Tema[];
  historial?: CambioEstado[];
  documentos?: Documento[];
  votos?: Voto[];
  prioridad?: PrioridadFeed;
}

export interface Comunicado {
  id: string;
  titulo: string;
  contenido: string;
  fuente: string;
  fecha: string;
  proyectoId?: string;
  proyectoTitulo?: string;
  diputadoId?: string;
  diputadoNombre?: string;
  comisionId?: string;
  comisionNombre?: string;
  prioridad: PrioridadFeed;
}

export interface ProyectoBrief {
  id: string;
  codigo: string;
  titulo: string;
}

export interface Comision {
  id: string;
  nombre: string;
  descripcion?: string;
  miembrosCount: number;
  proyectosCount: number;
  miembros?: DiputadoResumen[];
  proyectos?: {
    id: string;
    codigo: string;
    titulo: string;
  }[];
}

export interface FiltrosComision {
  busqueda?: string;
  page?: number;
}

export interface FiltrosDiputados {
  busqueda?: string;
  partido?: string;
  page?: number;
}
