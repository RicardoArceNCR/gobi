from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base
from app.models.base import TimestampMixin
from app.models.diputado import diputado_comision

class Comision(Base, TimestampMixin):
    __tablename__ = "comisiones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(300), nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)

    miembros = relationship("Diputado", secondary=diputado_comision, back_populates="comisiones")
    proyectos = relationship("ProyectoLey", back_populates="comision")
