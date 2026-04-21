from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.proyecto import Tema
from app.schemas.base import TemaOut

router = APIRouter(prefix="/temas", tags=["temas"])

@router.get("", response_model=list[TemaOut])
def listar_temas(db: Session = Depends(get_db)):
    return db.query(Tema).order_by(Tema.nombre.asc()).all()
