# app/schemas/comision.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from app.schemas.base import ComisionResumenOut, DiputadoResumenOut


class ComisionOut(ComisionResumenOut):
    pass  # hereda id, nombre, descripcion


class ProyectoResumenBrief(BaseModel):
    """Versión mínima de proyecto para evitar circular import"""
    id: UUID
    codigo: str
    titulo: str
    model_config = ConfigDict(from_attributes=True)


class ComisionDetalleOut(ComisionOut):
    miembros: list[DiputadoResumenOut] = []
    proyectos: list[ProyectoResumenBrief] = []


class ComisionListaOut(ComisionResumenOut):
    miembros_count: int = 0
    proyectos_count: int = 0
