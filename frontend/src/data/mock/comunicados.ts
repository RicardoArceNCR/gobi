// /src/data/mock/comunicados.ts
import type { Comunicado } from "@/types";

export const COMUNICADOS: Comunicado[] = [
  {
    id: "comun-001",
    titulo: "Comisión de Económicos aprueba dictamen sobre Ley de Inversión Extranjera",
    contenido: "La Comisión Permanente de Asuntos Económicos ha votado a favor de forma unánime el dictamen afirmativo de mayoría para el expediente 23.450. Con esta aprobación, se espera que el plenario discuta y someta a votación el texto en las próximas tres semanas, buscando dar una señal positiva a los mercados internacionales.",
    fuente: "Departamento de Prensa y Comunicación - Asamblea Legislativa",
    fecha: "2023-11-20T14:30:00Z",
    proyectoId: "proy-001",
    proyectoTitulo: "Ley de Fortalecimiento de la Inversión Extranjera Directa y Zonas Francas",
    comisionId: "com-001",
    comisionNombre: "Económicos",
    prioridad: "urgente"
  },
  {
    id: "comun-002",
    titulo: "Diputado Arias insta al Poder Ejecutivo a convocar Reforma de Seguridad en período de sesiones extraordinarias",
    contenido: "El presidente del Congreso, don Rodrigo Arias Sánchez, hizo un fuerte llamado al Ministro de la Presidencia para que se prioricen los proyectos enfocados en la contención del crimen organizado durante este periodo de sesiones extraordinarias, señalando la crisis de seguridad como la 'urgencia número uno' del país.",
    fuente: "Oficina del Presidente Legislativo",
    fecha: "2024-04-10T09:15:00Z",
    diputadoId: "dip-001",
    diputadoNombre: "Rodrigo Arias Sánchez",
    prioridad: "actualizado"
  },
  {
    id: "comun-003",
    titulo: "Inicia periodo de consultas para la nueva Ley de Aguas",
    contenido: "La Comisión con Potestad Legislativa Plena recibirá audiencias del Ministerio de Ambiente (MINAE), organizaciones ambientalistas y el sector agrícola agroindustrial en relación con el proyecto de Ley Marco para la Protección y Gestión Integrada del Recurso Hídrico (Expediente 24.102).",
    fuente: "Departamento de Prensa y Comunicación - Asamblea Legislativa",
    fecha: "2024-03-05T10:00:00Z",
    proyectoId: "proy-002",
    proyectoTitulo: "Ley Marco para la Protección y Gestión Integrada del Recurso Hídrico",
    comisionId: "com-002",
    comisionNombre: "Ambiente",
    prioridad: "en_debate"
  }
];

export const COMUNICADOS_BY_ID: Record<string, Comunicado> = Object.fromEntries(
  COMUNICADOS.map((c) => [c.id, c])
);
