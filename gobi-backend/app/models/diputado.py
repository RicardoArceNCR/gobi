from sqlalchemy import Column, String, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base
from app.models.base import TimestampMixin

# Tabla de unión diputado <-> comision
diputado_comision = Table(
    "diputado_comision",
    Base.metadata,
    Column("diputado_id", UUID(as_uuid=True), ForeignKey("diputados.id"), primary_key=True),
    Column("comision_id", UUID(as_uuid=True), ForeignKey("comisiones.id"), primary_key=True),
)

class Partido(Base):
    __tablename__ = "partidos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False, unique=True)
    color_hex = Column(String(7), nullable=False, default="#6b7280")
    logo_url = Column(String(500), nullable=True)

    diputados = relationship("Diputado", back_populates="partido")


class Diputado(Base, TimestampMixin):
    __tablename__ = "diputados"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(200), nullable=False)
    foto_url = Column(String(500), nullable=True)
    partido_id = Column(UUID(as_uuid=True), ForeignKey("partidos.id"), nullable=False)
    salario = Column(Integer, nullable=False, default=0)
    monto_gasolina = Column(Integer, nullable=False, default=0)
    fecha_inicio = Column(String(10), nullable=False)

    partido = relationship("Partido", back_populates="diputados")
    comisiones = relationship("Comision", secondary=diputado_comision, back_populates="miembros")
    proyectos = relationship("ProyectoLey", back_populates="proponente")
    votos = relationship("Voto", back_populates="diputado")
