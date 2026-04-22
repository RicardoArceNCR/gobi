from fastapi import HTTPException, Security
from typing import Callable

from app.core.auth import get_current_user

Capability = str

ROLE_CAPABILITIES = {
    "ciudadano": {
        "proyectos.view",
        "diputados.view",
        "comisiones.view",
        "documentos.download",
    },
    "diputado": {
        "proyectos.view",
        "diputados.view",
        "comisiones.view",
        "documentos.download",
    },
    "admin": {
        "proyectos.view",
        "proyectos.edit",
        "proyectos.change_state",
        "diputados.view",
        "comisiones.view",
        "documentos.download",
        "bitacora.view",
    },
}


def has_capability(user: dict, capability: Capability) -> bool:
    rol = user.get("rol", "ciudadano")
    capabilities = ROLE_CAPABILITIES.get(rol, ROLE_CAPABILITIES["ciudadano"])
    return capability in capabilities


def require_capability(capability: Capability) -> Callable:
    async def dependency(user=Security(get_current_user)):
        if not has_capability(user, capability):
            raise HTTPException(
                status_code=403,
                detail=f"No tienes permiso para: {capability}"
            )
        return user

    return dependency
