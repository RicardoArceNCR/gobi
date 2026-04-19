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

export interface Diputado {
  id: string;
  nombre: string;
  fotoUrl?: string;
  partidoId: string;
  partido: Partido;
  comisionIds: string[];
  salario: number;
  montoGasolina: number;
  fechaInicio: string;
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
  fechaSubida: string;
}

export interface Voto {
  diputadoId: string;
  diputadoNombre: string;
  partido: string;
  valor: ValorVoto;
}

export interface ProyectoLey {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  textoCompleto?: string; // camelCase en frontend (snake_case en backend)
  estado: EstadoProyecto;
  fechaPresentacion: string;
  fechaUltimoCambio: string;
  proponente: Diputado;
  comisionId: string;
  comisionNombre: string;
  temas: Tema[];
  historial: CambioEstado[];
  documentos: Documento[];
  votos: Voto[];
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

export interface Comision {
  id: string;
  nombre: string;
  descripcion: string;
  miembros: Diputado[];
  proyectosActivos: number;
}
