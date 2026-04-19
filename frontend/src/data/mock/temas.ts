// /src/data/mock/temas.ts
import type { Tema } from "@/types";

export const TEMAS: Tema[] = [
  {
    id: "tema-001",
    nombre: "Economía y Finanzas",
    slug: "economia-finanzas",
    colorHex: "#3B82F6",
  },
  {
    id: "tema-002",
    nombre: "Salud Pública",
    slug: "salud-publica",
    colorHex: "#10B981",
  },
  {
    id: "tema-003",
    nombre: "Educación",
    slug: "educacion",
    colorHex: "#F59E0B",
  },
  {
    id: "tema-004",
    nombre: "Seguridad Ciudadana",
    slug: "seguridad-ciudadana",
    colorHex: "#EF4444",
  },
  {
    id: "tema-005",
    nombre: "Medio Ambiente",
    slug: "medio-ambiente",
    colorHex: "#22C55E",
  },
  {
    id: "tema-006",
    nombre: "Trabajo y Empleo",
    slug: "trabajo-empleo",
    colorHex: "#8B5CF6",
  },
  {
    id: "tema-007",
    nombre: "Infraestructura y Transporte",
    slug: "infraestructura-transporte",
    colorHex: "#F97316",
  },
  {
    id: "tema-008",
    nombre: "Derechos Humanos",
    slug: "derechos-humanos",
    colorHex: "#EC4899",
  },
  {
    id: "tema-009",
    nombre: "Tecnología e Innovación",
    slug: "tecnologia-innovacion",
    colorHex: "#06B6D4",
  },
  {
    id: "tema-010",
    nombre: "Vivienda",
    slug: "vivienda",
    colorHex: "#D97706",
  },
];

/** Lookup rápido por id */
export const TEMAS_BY_ID: Record<string, Tema> = Object.fromEntries(
  TEMAS.map((t) => [t.id, t])
);

/** Lookup rápido por slug */
export const TEMAS_BY_SLUG: Record<string, Tema> = Object.fromEntries(
  TEMAS.map((t) => [t.slug, t])
);
