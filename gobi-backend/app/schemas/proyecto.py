from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID
from app.models.proyecto import EstadoProyecto

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
    diputado_nombre: str   # viene del join con Diputado en la query
    partido: str           # viene de diputado.partido.nombre (resuelto en el router)
    valor: str
    model_config = {"from_attributes": True}

class ProyectoResumenOut(BaseModel):
    id: UUID
    codigo: str
    titulo: str
    descripcion: str
    estado: EstadoProyecto
    fecha_presentacion: str
    fecha_ultimo_cambio: str   # mapeado desde updated_at del modelo (TimestampMixin)
    proponente: DiputadoResumenOut
    comision_nombre: Optional[str]
    temas: list[TemaOut]
    model_config = {"from_attributes": True}

    @field_validator("fecha_ultimo_cambio", mode="before")
    def format_updated_at(cls, v):
        # updated_at viene de TimestampMixin como datetime — convertir a string
        return str(v)[:10] if v else ""

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
