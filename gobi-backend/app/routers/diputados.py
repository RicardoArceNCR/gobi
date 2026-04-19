from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.database import get_db
from app.models.diputado import Diputado
from app.schemas.diputado import DiputadoOut
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/diputados", tags=["diputados"])

@router.get("", response_model=PaginatedResponse[DiputadoOut])
def listar_diputados(
    partido: Optional[str] = None,
    busqueda: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Diputado)
    if busqueda:
        q = q.filter(Diputado.nombre.ilike(f"%{busqueda}%"))
    if partido:
        from app.models.diputado import Partido
        q = q.join(Partido).filter(Partido.nombre.ilike(f"%{partido}%"))

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return {"items": items, "total": total, "page": page, "page_size": page_size, "total_pages": -(-total // page_size)}


@router.get("/{diputado_id}", response_model=DiputadoOut)
def obtener_diputado(diputado_id: UUID, db: Session = Depends(get_db)):
    d = db.query(Diputado).filter(Diputado.id == diputado_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Diputado no encontrado")
    return d
