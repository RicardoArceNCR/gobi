from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.diputado import Partido
from app.schemas.base import PartidoOut

router = APIRouter(prefix="/partidos", tags=["partidos"])

@router.get("", response_model=list[PartidoOut])
def listar_partidos(db: Session = Depends(get_db)):
    return db.query(Partido).order_by(Partido.nombre.asc()).all()
