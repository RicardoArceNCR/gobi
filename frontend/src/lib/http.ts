/**
 * Limpia un objeto de parámetros para enviar en peticiones HTTP.
 * Elimina valores: undefined, null, "" y "todos".
 */
export function limpiarParams(obj: Record<string, unknown>): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => 
      v !== undefined && 
      v !== null && 
      v !== "" && 
      v !== "todos"
    )
  ) as Record<string, string | number | boolean>;
}
