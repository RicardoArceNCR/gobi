from pydantic import BaseModel, ConfigDict
from typing import Optional, TYPE_CHECKING
from uuid import UUID

if TYPE_CHECKING:
    from app.schemas.proyecto import DiputadoResumenOut, ProyectoResumenOut

class ComisionOut(BaseModel):
    id: UUID
    nombre: str
    descripcion: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ComisionResumenOut(ComisionOut):
    pass

class ComisionDetalleOut(ComisionOut):
    miembros: list["DiputadoResumenOut"] = []
    proyectos: list["ProyectoResumenOut"] = []
