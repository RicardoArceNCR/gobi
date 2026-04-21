import type { Tema } from "@/types";

export interface BackendTema {
  id: string;
  nombre: string;
  slug: string;
  color_hex: string;
}

export function adaptTema(tema: BackendTema): Tema {
  return {
    id: tema.id,
    nombre: tema.nombre,
    slug: tema.slug,
    colorHex: tema.color_hex,
  };
}
