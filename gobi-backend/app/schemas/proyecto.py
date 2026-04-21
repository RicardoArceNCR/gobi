from datetime import date, datetime
from pydantic import BaseModel, field_validator, computed_field, ConfigDict
from typing import Optional
from uuid import UUID

from app.models.proyecto import EstadoProyecto, ValorVoto
from app.schemas.base import TemaOut, DiputadoResumenOut, ComisionResumenOut, PartidoOut


class CambioEstadoOut(BaseModel):
    id: UUID
    estado_anterior: EstadoProyecto
    estado_nuevo: EstadoProyecto
    motivo: str
    usuario_nombre: str
    created_at: str

    model_config = ConfigDict(from_attributes=True)

    @field_validator("created_at", mode="before")
    @classmethod
    def format_created_at(cls, v):
        if isinstance(v, datetime):
            return v.date().isoformat()
        return str(v)[:10] if v else ""


class DocumentoOut(BaseModel):
    id: UUID
    nombre: str
    url: str
    tipo: str
    created_at: str

    model_config = ConfigDict(from_attributes=True)

    @field_validator("created_at", mode="before")
    @classmethod
    def format_created_at(cls, v):
        if isinstance(v, datetime):
            return v.date().isoformat()
        return str(v)[:10] if v else ""


class DiputadoVotoOut(BaseModel):
    id: UUID
    nombre: str
    partido: Optional[PartidoOut] = None

    model_config = ConfigDict(from_attributes=True)


class VotoOut(BaseModel):
    diputado_id: UUID
    valor: ValorVoto
    diputado: Optional[DiputadoVotoOut] = None

    model_config = ConfigDict(from_attributes=True)


class ProyectoResumenOut(BaseModel):
    id: UUID
    codigo: str
    titulo: str
    descripcion: str
    estado: EstadoProyecto
    fecha_presentacion: str
    proponente: DiputadoResumenOut
    temas: list[TemaOut] = []
    comision: Optional[ComisionResumenOut] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("fecha_presentacion", mode="before")
    @classmethod
    def format_fecha_presentacion(cls, v):
        if isinstance(v, date):
            return v.isoformat()
        return str(v)[:10] if v else ""

    @computed_field
    @property
    def fecha_ultimo_cambio(self) -> str:
        if isinstance(self.updated_at, datetime):
            return self.updated_at.date().isoformat()
        return str(self.updated_at)[:10] if self.updated_at else ""


class ProyectoDetalleOut(ProyectoResumenOut):
    historial: list[CambioEstadoOut] = []
    documentos: list[DocumentoOut] = []
    votos: list[VotoOut] = []


class ProyectoCreate(BaseModel):
    codigo: str
    titulo: str
    descripcion: str
    texto_completo: Optional[str] = None
    estado: EstadoProyecto = EstadoProyecto.presentado
    fecha_presentacion: date
    proponente_id: UUID
    comision_id: Optional[UUID] = None
    tema_ids: list[UUID] = []


class ProyectoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    texto_completo: Optional[str] = None
    comision_id: Optional[UUID] = None
    tema_ids: Optional[list[UUID]] = None


class CambioEstadoCreate(BaseModel):
    estado_nuevo: EstadoProyecto
    motivo: str
