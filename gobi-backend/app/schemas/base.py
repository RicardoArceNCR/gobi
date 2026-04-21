# app/schemas/base.py
# Tipos primitivos compartidos — no importa nada interno
from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID


class PartidoOut(BaseModel):
    id: UUID
    nombre: str
    color_hex: str
    model_config = ConfigDict(from_attributes=True)


class TemaOut(BaseModel):
    id: UUID
    nombre: str
    slug: str
    color_hex: str
    model_config = ConfigDict(from_attributes=True)


class DiputadoResumenOut(BaseModel):
    id: UUID
    nombre: str
    foto_url: Optional[str] = None
    partido: PartidoOut
    model_config = ConfigDict(from_attributes=True)


class ComisionResumenOut(BaseModel):
    id: UUID
    nombre: str
    descripcion: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
