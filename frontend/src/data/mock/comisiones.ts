// /src/data/mock/comisiones.ts
import type { Comision } from "@/types";
import { DIPUTADOS } from "./diputados";

export const COMISIONES: Comision[] = [
  {
    id: "com-001",
    nombre: "Comisión Permanente de Asuntos Económicos",
    descripcion: "Analiza proyectos relacionados con finanzas públicas, presupuestos e impuestos, desarrollo económico y comercio.",
    miembros: DIPUTADOS.filter(d => d.comisionIds.includes("com-001")),
    proyectosActivos: 12,
  },
  {
    id: "com-002",
    nombre: "Comisión Permanente de Asuntos Agropecuarios y Recursos Naturales",
    descripcion: "Estudia iniciativas sobre agricultura, ganadería, ambiente, conservación de recursos naturales y energía.",
    miembros: DIPUTADOS.filter(d => d.comisionIds.includes("com-002")),
    proyectosActivos: 8,
  },
  {
    id: "com-003",
    nombre: "Comisión Permanente de Asuntos Hacendarios",
    descripcion: "Encargada de tramitar los presupuestos de la República, leyes de deudas y préstamos internacionales.",
    miembros: DIPUTADOS.filter(d => d.comisionIds.includes("com-003")),
    proyectosActivos: 15,
  },
  {
    id: "com-004",
    nombre: "Comisión Permanente de Asuntos Jurídicos",
    descripcion: "Revisa proyectos vinculados con códigos, reglamentos e interpretación de las leyes generales.",
    miembros: DIPUTADOS.filter(d => d.comisionIds.includes("com-004")),
    proyectosActivos: 22,
  }
];

export const COMISIONES_BY_ID: Record<string, Comision> = Object.fromEntries(
  COMISIONES.map((c) => [c.id, c])
);
