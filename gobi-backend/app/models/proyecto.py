from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid, enum
from app.database import Base
from app.models.base import TimestampMixin

class EstadoProyecto(str, enum.Enum):
    presentado = "presentado"
    en_comision = "en_comision"
    en_debate = "en_debate"
    votado = "votado"
    aprobado = "aprobado"
    archivado = "archivado"

class ValorVoto(str, enum.Enum):
    a_favor = "a_favor"
    en_contra = "en_contra"
    abstencion = "abstencion"
    ausente = "ausente"

# Tabla de unión proyecto <-> tema
proyecto_tema = Table(
    "proyecto_tema",
    Base.metadata,
    Column("proyecto_id", UUID(as_uuid=True), ForeignKey("proyectos_ley.id"), primary_key=True),
    Column("tema_id", UUID(as_uuid=True), ForeignKey("temas.id"), primary_key=True),
)

class Tema(Base):
    __tablename__ = "temas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    color_hex = Column(String(7), nullable=False, default="#6b7280")


class ProyectoLey(Base, TimestampMixin):
    __tablename__ = "proyectos_ley"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    codigo = Column(String(20), nullable=False, unique=True, index=True)
    titulo = Column(String(500), nullable=False)
    descripcion = Column(Text, nullable=False)
    texto_completo = Column(Text, nullable=True)
    estado = Column(Enum(EstadoProyecto), nullable=False, default=EstadoProyecto.presentado)
    fecha_presentacion = Column(String(10), nullable=False)

    proponente_id = Column(UUID(as_uuid=True), ForeignKey("diputados.id"), nullable=False)
    comision_id = Column(UUID(as_uuid=True), ForeignKey("comisiones.id"), nullable=True)

    proponente = relationship("Diputado", back_populates="proyectos")
    comision = relationship("Comision", back_populates="proyectos")
    temas = relationship("Tema", secondary=proyecto_tema)
    historial = relationship("CambioEstado", back_populates="proyecto", order_by="CambioEstado.created_at")
    documentos = relationship("Documento", back_populates="proyecto")
    votos = relationship("Voto", back_populates="proyecto")


class CambioEstado(Base):
    __tablename__ = "cambios_estado"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos_ley.id"), nullable=False)
    estado_anterior = Column(Enum(EstadoProyecto), nullable=False)
    estado_nuevo = Column(Enum(EstadoProyecto), nullable=False)
    motivo = Column(Text, nullable=False)
    usuario_id = Column(String(200), nullable=False)
    usuario_nombre = Column(String(200), nullable=False)
    created_at = Column(DateTime, nullable=False)

    proyecto = relationship("ProyectoLey", back_populates="historial")


class Voto(Base):
    __tablename__ = "votos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos_ley.id"), nullable=False)
    diputado_id = Column(UUID(as_uuid=True), ForeignKey("diputados.id"), nullable=False)
    valor = Column(Enum(ValorVoto), nullable=False)

    proyecto = relationship("ProyectoLey", back_populates="votos")
    diputado = relationship("Diputado", back_populates="votos")


class Documento(Base):
    __tablename__ = "documentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos_ley.id"), nullable=False)
    nombre = Column(String(300), nullable=False)
    url = Column(String(500), nullable=False)
    tipo = Column(String(20), nullable=False, default="pdf")
    created_at = Column(DateTime, nullable=False)

    proyecto = relationship("ProyectoLey", back_populates="documentos")
