from pydantic import BaseModel, field_validator, computed_field, ConfigDict
from typing import Optional
from uuid import UUID
from app.models.proyecto import EstadoProyecto
from app.schemas.comision import ComisionOut

class TemaOut(BaseModel):
    id: UUID
    nombre: str
    slug: str
    color_hex: str
    model_config = {"from_attributes": True}

class PartidoOut(BaseModel):
    id: UUID
    nombre: str
    color_hex: str
    model_config = {"from_attributes": True}

class DiputadoResumenOut(BaseModel):
    id: UUID
    nombre: str
    foto_url: Optional[str]
    partido: PartidoOut
    model_config = {"from_attributes": True}

class CambioEstadoOut(BaseModel):
    id: UUID
    estado_anterior: EstadoProyecto
    estado_nuevo: EstadoProyecto
    motivo: str
    usuario_nombre: str
    created_at: str
    model_config = {"from_attributes": True}

    @field_validator("created_at", mode="before")
    def format_date(cls, v):
        return str(v)[:10] if v else ""

class DocumentoOut(BaseModel):
    id: UUID
    nombre: str
    url: str
    tipo: str
    model_config = {"from_attributes": True}

class VotoOut(BaseModel):
    diputado_id: UUID
    diputado_nombre: str
    partido: str
    valor: str
    model_config = {"from_attributes": True}

class ProyectoResumenOut(BaseModel):
    id: UUID
    codigo: str
    titulo: str
    descripcion: str
    estado: EstadoProyecto
    fecha_presentacion: str
    proponente: DiputadoResumenOut
    temas: list[TemaOut]

    # campos relacionados para serialización
    comision: Optional[ComisionOut] = None
    updated_at: Optional[object] = None

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def fecha_ultimo_cambio(self) -> str:
        return str(self.updated_at)[:10] if self.updated_at else ""

    @computed_field
    @property
    def comision_nombre(self) -> Optional[str]:
        if not self.comision:
            return None
        return getattr(self.comision, "nombre", None)

class ProyectoDetalleOut(ProyectoResumenOut):
    historial: list[CambioEstadoOut]
    documentos: list[DocumentoOut]
    votos: list[VotoOut]

class ProyectoCreate(BaseModel):
    codigo: str
    titulo: str
    descripcion: str
    texto_completo: Optional[str] = None
    estado: EstadoProyecto = EstadoProyecto.presentado
    fecha_presentacion: str
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
