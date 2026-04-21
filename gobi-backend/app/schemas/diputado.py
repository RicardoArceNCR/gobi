from datetime import date
from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
from uuid import UUID
from app.schemas.base import PartidoOut, ComisionResumenOut


class DiputadoOut(BaseModel):
    id: UUID
    nombre: str
    foto_url: Optional[str] = None
    salario: int
    monto_gasolina: int
    fecha_inicio: str
    partido: PartidoOut
    comisiones: list[ComisionResumenOut] = []

    model_config = ConfigDict(from_attributes=True)

    @field_validator("fecha_inicio", mode="before")
    @classmethod
    def format_fecha_inicio(cls, v):
        if isinstance(v, date):
            return v.isoformat()
        return str(v)[:10] if v else ""
