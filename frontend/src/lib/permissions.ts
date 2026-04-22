import type { RolUsuario } from "@/types";

export type Capability =
  | "proyectos.view"
  | "proyectos.edit"
  | "proyectos.change_state"
  | "diputados.view"
  | "comisiones.view"
  | "documentos.download"
  | "bitacora.view";

const ROLE_CAPABILITIES: Record<RolUsuario, Capability[]> = {
  ciudadano: [
    "proyectos.view",
    "diputados.view",
    "comisiones.view",
    "documentos.download",
  ],
  diputado: [
    "proyectos.view",
    "diputados.view",
    "comisiones.view",
    "documentos.download",
  ],
  admin: [
    "proyectos.view",
    "proyectos.edit",
    "proyectos.change_state",
    "diputados.view",
    "comisiones.view",
    "documentos.download",
    "bitacora.view",
  ],
};

export function getRoleCapabilities(role: RolUsuario | null | undefined): Capability[] {
  if (!role) return ROLE_CAPABILITIES.ciudadano;
  return ROLE_CAPABILITIES[role] ?? ROLE_CAPABILITIES.ciudadano;
}

export function hasCapability(
  role: RolUsuario | null | undefined,
  capability: Capability
): boolean {
  return getRoleCapabilities(role).includes(capability);
}

export function canEditProyecto(role: RolUsuario | null | undefined): boolean {
  return hasCapability(role, "proyectos.edit");
}

export function canChangeProyectoEstado(role: RolUsuario | null | undefined): boolean {
  return hasCapability(role, "proyectos.change_state");
}

export function canViewBitacora(role: RolUsuario | null | undefined): boolean {
  return hasCapability(role, "bitacora.view");
}
