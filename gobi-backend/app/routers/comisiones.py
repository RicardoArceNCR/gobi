from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.database import get_db
from app.models.comision import Comision
from app.schemas.comision import ComisionResumenOut, ComisionDetalleOut
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/comisiones", tags=["comisiones"])

@router.get("", response_model=PaginatedResponse[ComisionResumenOut])
def listar_comisiones(
    busqueda: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Comision)
    if busqueda:
        q = q.filter(Comision.nombre.ilike(f"%{busqueda}%"))

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total, "page": page, "page_size": page_size, "total_pages": -(-total // page_size)}

@router.get("/{comision_id}", response_model=ComisionDetalleOut)
def obtener_comision(comision_id: UUID, db: Session = Depends(get_db)):
    c = db.query(Comision).filter(Comision.id == comision_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Comisión no encontrada")
    return c
