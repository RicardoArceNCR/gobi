import { api } from "./api";
import { adaptTema, BackendTema } from "@/adapters/temas";
import type { Tema } from "@/types";

export async function getTemas(): Promise<Tema[]> {
  const { data } = await api.get<BackendTema[]>("/temas");
  return data.map(adaptTema);
}
