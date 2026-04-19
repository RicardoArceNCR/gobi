from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from app.schemas.proyecto import DiputadoResumenOut, ProyectoResumenOut

class ComisionResumenOut(BaseModel):
    id: UUID
    nombre: str
    descripcion: Optional[str] = None
    model_config = {"from_attributes": True}

class ComisionDetalleOut(ComisionResumenOut):
    miembros: list[DiputadoResumenOut] = []
    proyectos: list[ProyectoResumenOut] = []
