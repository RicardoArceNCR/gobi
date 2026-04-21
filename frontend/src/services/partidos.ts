import { api } from "./api";
import type { Partido } from "@/types";

export interface BackendPartido {
  id: string;
  nombre: string;
  color_hex: string;
  logo_url?: string;
}

export const getPartidos = async (): Promise<Partido[]> => {
  const { data } = await api.get<BackendPartido[]>("/partidos");
  return data.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    colorHex: p.color_hex,
    logoUrl: p.logo_url,
  }));
};
