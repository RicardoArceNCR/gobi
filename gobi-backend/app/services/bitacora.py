from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app.models.bitacora import EntradaBitacora

def registrar(
    db: Session,
    entidad_tipo: str,
    entidad_id: str,
    accion: str,
    motivo: str,
    usuario_id: str,
    usuario_nombre: str,
    campo_modificado: Optional[str] = None,
    valor_anterior: Optional[str] = None,
    valor_nuevo: Optional[str] = None,
):
    entrada = EntradaBitacora(
        entidad_tipo=entidad_tipo,
        entidad_id=entidad_id,
        accion=accion,
        campo_modificado=campo_modificado,
        valor_anterior=valor_anterior,
        valor_nuevo=valor_nuevo,
        motivo=motivo,
        usuario_id=usuario_id,
        usuario_nombre=usuario_nombre,
        created_at=datetime.utcnow(),
    )
    db.add(entrada)
    db.flush()
