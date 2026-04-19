from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from app.schemas.proyecto import PartidoOut

class ComisionResumenOut(BaseModel):
    id: UUID
    nombre: str
    model_config = {"from_attributes": True}

class DiputadoOut(BaseModel):
    id: UUID
    nombre: str
    foto_url: Optional[str]
    salario: int
    monto_gasolina: int
    fecha_inicio: str
    partido: PartidoOut
    comisiones: list[ComisionResumenOut] = []
    model_config = {"from_attributes": True}
