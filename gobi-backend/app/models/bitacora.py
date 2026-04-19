from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class EntradaBitacora(Base):
    __tablename__ = "bitacora"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entidad_tipo = Column(String(50), nullable=False)  # proyecto, diputado, usuario
    entidad_id = Column(String(200), nullable=False)
    accion = Column(String(50), nullable=False)         # creacion, edicion, cambio_estado, eliminacion
    campo_modificado = Column(String(100), nullable=True)
    valor_anterior = Column(Text, nullable=True)
    valor_nuevo = Column(Text, nullable=True)
    motivo = Column(Text, nullable=False)
    usuario_id = Column(String(200), nullable=False)
    usuario_nombre = Column(String(200), nullable=False)
    created_at = Column(DateTime, nullable=False)
