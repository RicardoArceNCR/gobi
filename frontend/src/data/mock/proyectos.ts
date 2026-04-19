// /src/data/mock/proyectos.ts
import type { ProyectoLey } from "@/types";
import { DIPUTADOS_BY_ID } from "./diputados";
import { TEMAS_BY_ID } from "./temas";

export const PROYECTOS: ProyectoLey[] = [
  {
    id: "proy-001",
    codigo: "23.450",
    titulo: "Ley de Fortalecimiento de la Inversión Extranjera Directa y Zonas Francas",
    descripcion: "Reforma a la ley de zonas francas para atraer nuevas inversiones tecnológicas al país mediante incentivos fiscales focalizados y reducción de trámites burocráticos.",
    textoCompleto: "El objeto de esta ley es establecer un marco jurídico actualizado que permita competir modernamente por la Inversión Extranjera Directa (IED)...",
    estado: "en_debate",
    fechaPresentacion: "2023-08-15",
    fechaUltimoCambio: "2023-11-20",
    proponente: DIPUTADOS_BY_ID["dip-001"],
    comisionId: "com-001",
    comisionNombre: "Económicos",
    temas: [TEMAS_BY_ID["tema-001"], TEMAS_BY_ID["tema-009"]],
    historial: [
      {
        id: "hist-001-1",
        estadoAnterior: "presentado",
        estadoNuevo: "en_comision",
        motivo: "Asignado a la Comisión Permanente de Asuntos Económicos",
        fecha: "2023-08-20",
        usuarioNombre: "Directorio Legislativo",
      },
      {
        id: "hist-001-2",
        estadoAnterior: "en_comision",
        estadoNuevo: "en_debate",
        motivo: "Dictamen afirmativo de mayoría rendido por la comisión.",
        fecha: "2023-11-20",
        usuarioNombre: "Secretaría de Comisiones",
      }
    ],
    documentos: [
      {
        id: "doc-001-1",
        nombre: "Texto Base del Proyecto",
        url: "#",
        tipo: "pdf",
        fechaSubida: "2023-08-15"
      },
      {
        id: "doc-001-2",
        nombre: "Dictamen Afirmativo de Mayoría",
        url: "#",
        tipo: "pdf",
        fechaSubida: "2023-11-19"
      }
    ],
    votos: [],
    prioridad: "urgente"
  },
  {
    id: "proy-002",
    codigo: "24.102",
    titulo: "Ley Marco para la Protección y Gestión Integrada del Recurso Hídrico",
    descripcion: "Establece principios y regulaciones de la gestión del agua con un enfoque moderno, sancionando la contaminación y protegiendo las fuentes de agua.",
    estado: "en_comision",
    fechaPresentacion: "2024-02-10",
    fechaUltimoCambio: "2024-03-01",
    proponente: DIPUTADOS_BY_ID["dip-004"],
    comisionId: "com-002",
    comisionNombre: "Ambiente",
    temas: [TEMAS_BY_ID["tema-005"]],
    historial: [
      {
        id: "hist-002-1",
        estadoAnterior: "presentado",
        estadoNuevo: "en_comision",
        motivo: "Asignado a la Comisión con Potestad Legislativa Plena",
        fecha: "2024-03-01",
        usuarioNombre: "Directorio Legislativo",
      }
    ],
    documentos: [
      {
        id: "doc-002-1",
        nombre: "Exposición de Motivos",
        url: "#",
        tipo: "pdf",
        fechaSubida: "2024-02-10"
      }
    ],
    votos: [],
    prioridad: "en_debate"
  },
  {
    id: "proy-003",
    codigo: "21.900",
    titulo: "Ley de Aprobación del Contrato de Préstamo para Infraestructura Educativa",
    descripcion: "Aprobación de crédito internacional para el remozamiento y construcción de 150 centros educativos en zonas rurales.",
    estado: "aprobado",
    fechaPresentacion: "2021-05-12",
    fechaUltimoCambio: "2022-10-15",
    proponente: DIPUTADOS_BY_ID["dip-002"],
    comisionId: "com-003",
    comisionNombre: "Hacendarios",
    temas: [TEMAS_BY_ID["tema-003"], TEMAS_BY_ID["tema-001"], TEMAS_BY_ID["tema-007"]],
    historial: [
      {
        id: "hist-003-1",
        estadoAnterior: "en_debate",
        estadoNuevo: "votado",
        motivo: "Aprobado en primer debate",
        fecha: "2022-10-10",
        usuarioNombre: "Plenario",
      },
      {
        id: "hist-003-2",
        estadoAnterior: "votado",
        estadoNuevo: "aprobado",
        motivo: "Aprobado en segundo debate definitivamente",
        fecha: "2022-10-15",
        usuarioNombre: "Plenario",
      }
    ],
    documentos: [],
    votos: [
      {
        diputadoId: "dip-001",
        diputadoNombre: "Rodrigo Arias Sánchez",
        partido: "Partido Liberación Nacional",
        valor: "a_favor"
      },
      {
        diputadoId: "dip-002",
        diputadoNombre: "María José Corrales",
        partido: "Partido Progreso Social Democrático",
        valor: "a_favor"
      },
      {
        diputadoId: "dip-003",
        diputadoNombre: "Carlos Avendaño Calvo",
        partido: "Partido Republicano Social Cristiano",
        valor: "a_favor"
      },
      {
        diputadoId: "dip-004",
        diputadoNombre: "Daniela Rojas Madrigal",
        partido: "Frente Amplio",
        valor: "en_contra"
      },
      {
        diputadoId: "dip-005",
        diputadoNombre: "Gustavo Viales Villegas",
        partido: "Partido Unidad Social Cristiana",
        valor: "abstencion"
      }
    ],
    prioridad: "actualizado"
  }
];

export const PROYECTOS_BY_ID: Record<string, ProyectoLey> = Object.fromEntries(
  PROYECTOS.map((p) => [p.id, p])
);
