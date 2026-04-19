// /src/data/mock/diputados.ts
import type { Diputado, Partido } from "@/types";

// ─── Partidos ────────────────────────────────────────────────────────────────

export const PARTIDOS: Partido[] = [
  {
    id: "partido-001",
    nombre: "Partido Liberación Nacional",
    colorHex: "#22C55E",
  },
  {
    id: "partido-002",
    nombre: "Partido Progreso Social Democrático",
    colorHex: "#3B82F6",
  },
  {
    id: "partido-003",
    nombre: "Partido Republicano Social Cristiano",
    colorHex: "#EF4444",
  },
  {
    id: "partido-004",
    nombre: "Frente Amplio",
    colorHex: "#F97316",
  },
  {
    id: "partido-005",
    nombre: "Partido Unidad Social Cristiana",
    colorHex: "#8B5CF6",
  },
  {
    id: "partido-006",
    nombre: "Nueva República",
    colorHex: "#6B7280",
  },
];

export const PARTIDOS_BY_ID: Record<string, Partido> = Object.fromEntries(
  PARTIDOS.map((p) => [p.id, p])
);

// ─── Diputados ────────────────────────────────────────────────────────────────

export const DIPUTADOS: Diputado[] = [
  {
    id: "dip-001",
    nombre: "Rodrigo Arias Sánchez",
    fotoUrl: "/mock/fotos/rodrigo-arias.jpg",
    partidoId: "partido-001",
    partido: PARTIDOS_BY_ID["partido-001"],
    comisionIds: ["com-001", "com-003"],
    salario: 3_864_820,
    montoGasolina: 280_000,
    fechaInicio: "2022-05-01",
  },
  {
    id: "dip-002",
    nombre: "María José Corrales",
    fotoUrl: "/mock/fotos/maria-corrales.jpg",
    partidoId: "partido-002",
    partido: PARTIDOS_BY_ID["partido-002"],
    comisionIds: ["com-002"],
    salario: 3_864_820,
    montoGasolina: 255_000,
    fechaInicio: "2022-05-01",
  },
  {
    id: "dip-003",
    nombre: "Carlos Avendaño Calvo",
    fotoUrl: "/mock/fotos/carlos-avendano.jpg",
    partidoId: "partido-003",
    partido: PARTIDOS_BY_ID["partido-003"],
    comisionIds: ["com-001", "com-004"],
    salario: 3_864_820,
    montoGasolina: 300_000,
    fechaInicio: "2022-05-01",
  },
  {
    id: "dip-004",
    nombre: "Daniela Rojas Madrigal",
    fotoUrl: "/mock/fotos/daniela-rojas.jpg",
    partidoId: "partido-004",
    partido: PARTIDOS_BY_ID["partido-004"],
    comisionIds: ["com-002", "com-003"],
    salario: 3_864_820,
    montoGasolina: 220_000,
    fechaInicio: "2022-05-01",
  },
  {
    id: "dip-005",
    nombre: "Gustavo Viales Villegas",
    fotoUrl: "/mock/fotos/gustavo-viales.jpg",
    partidoId: "partido-005",
    partido: PARTIDOS_BY_ID["partido-005"],
    comisionIds: ["com-004"],
    salario: 3_864_820,
    montoGasolina: 310_000,
    fechaInicio: "2022-05-01",
  },
  {
    id: "dip-006",
    nombre: "Lourdes Prado Núñez",
    fotoUrl: "/mock/fotos/lourdes-prado.jpg",
    partidoId: "partido-006",
    partido: PARTIDOS_BY_ID["partido-006"],
    comisionIds: ["com-001"],
    salario: 3_864_820,
    montoGasolina: 240_000,
    fechaInicio: "2022-05-01",
  },
  {
    id: "dip-007",
    nombre: "Andrey Mora Chinchilla",
    fotoUrl: "/mock/fotos/andrey-mora.jpg",
    partidoId: "partido-001",
    partido: PARTIDOS_BY_ID["partido-001"],
    comisionIds: ["com-002", "com-004"],
    salario: 3_864_820,
    montoGasolina: 265_000,
    fechaInicio: "2022-05-01",
  },
  {
    id: "dip-008",
    nombre: "Sofía Hernández Arce",
    fotoUrl: "/mock/fotos/sofia-hernandez.jpg",
    partidoId: "partido-002",
    partido: PARTIDOS_BY_ID["partido-002"],
    comisionIds: ["com-003"],
    salario: 3_864_820,
    montoGasolina: 290_000,
    fechaInicio: "2022-05-01",
  },
];

export const DIPUTADOS_BY_ID: Record<string, Diputado> = Object.fromEntries(
  DIPUTADOS.map((d) => [d.id, d])
);
