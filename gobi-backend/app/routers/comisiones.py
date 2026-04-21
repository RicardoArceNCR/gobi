from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, selectinload, joinedload
from uuid import UUID
from typing import Optional

from app.database import get_db
from app.models.comision import Comision
from app.models.diputado import Diputado
from app.schemas.comision import ComisionResumenOut, ComisionDetalleOut, ComisionListaOut
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/comisiones", tags=["comisiones"])


@router.get("", response_model=PaginatedResponse[ComisionListaOut])
def listar_comisiones(
    busqueda: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Comision).options(
        selectinload(Comision.miembros),
        selectinload(Comision.proyectos)
    )

    if busqueda:
        q = q.filter(Comision.nombre.ilike(f"%{busqueda}%"))

    total = q.count()
    comisiones = q.offset((page - 1) * page_size).limit(page_size).all()

    # Enriquecer con conteos
    items = []
    for c in comisiones:
        comision_dict = ComisionListaOut.model_validate(c).model_dump()
        comision_dict["miembros_count"] = len(c.miembros)
        comision_dict["proyectos_count"] = len(c.proyectos)
        items.append(comision_dict)

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": -(-total // page_size),
    }


@router.get("/{comision_id}", response_model=ComisionDetalleOut)
def obtener_comision(comision_id: UUID, db: Session = Depends(get_db)):
    comision = (
        db.query(Comision)
        .options(
            selectinload(Comision.miembros).joinedload(Diputado.partido),
            selectinload(Comision.proyectos),
        )
        .filter(Comision.id == comision_id)
        .first()
    )

    if not comision:
        raise HTTPException(status_code=404, detail="Comisión no encontrada")

    return comision
