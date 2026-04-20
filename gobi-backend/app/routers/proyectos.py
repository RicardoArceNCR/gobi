from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload, selectinload
from uuid import UUID
from typing import Optional

from app.database import get_db
from app.models.proyecto import ProyectoLey, EstadoProyecto, CambioEstado
from app.schemas.proyecto import (
    ProyectoResumenOut, ProyectoDetalleOut,
    ProyectoCreate, ProyectoUpdate, CambioEstadoCreate
)
from app.schemas.common import PaginatedResponse
from app.core.auth import get_current_user, require_admin
from app.services.bitacora import registrar
from datetime import datetime

router = APIRouter(prefix="/proyectos", tags=["proyectos"])

@router.get("", response_model=PaginatedResponse[ProyectoResumenOut])
def listar_proyectos(
    estado: Optional[EstadoProyecto] = None,
    tema: Optional[str] = None,
    partido: Optional[str] = None,
    busqueda: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = (
        db.query(ProyectoLey)
        .options(
            joinedload(ProyectoLey.comision),
            joinedload(ProyectoLey.proponente),
            selectinload(ProyectoLey.temas)
        )
    )

    if estado:
        q = q.filter(ProyectoLey.estado == estado)
    if busqueda:
        q = q.filter(
            ProyectoLey.titulo.ilike(f"%{busqueda}%") |
            ProyectoLey.codigo.ilike(f"%{busqueda}%")
        )
    if tema:
        from app.models.proyecto import Tema, proyecto_tema
        q = q.join(proyecto_tema).join(Tema).filter(Tema.slug == tema)
    if partido:
        from app.models.diputado import Diputado, Partido
        q = q.join(Diputado).join(Partido).filter(Partido.nombre.ilike(f"%{partido}%"))

    total = q.count()
    proyectos = q.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": proyectos,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": -(-total // page_size),
    }

@router.get("/{proyecto_id}", response_model=ProyectoDetalleOut)
def obtener_proyecto(proyecto_id: UUID, db: Session = Depends(get_db)):
    proyecto = (
        db.query(ProyectoLey)
        .options(
            joinedload(ProyectoLey.comision),
            joinedload(ProyectoLey.proponente),
            selectinload(ProyectoLey.temas),
            selectinload(ProyectoLey.votos),
            selectinload(ProyectoLey.documentos),
            selectinload(ProyectoLey.historial)
        )
        .filter(ProyectoLey.id == proyecto_id)
        .first()
    )
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto

@router.post("", response_model=ProyectoDetalleOut, status_code=201)
def crear_proyecto(
    body: ProyectoCreate,
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    if db.query(ProyectoLey).filter(ProyectoLey.codigo == body.codigo).first():
        raise HTTPException(status_code=400, detail=f"Ya existe el expediente {body.codigo}")

    proyecto = ProyectoLey(**body.model_dump(exclude={"tema_ids"}))

    if body.tema_ids:
        from app.models.proyecto import Tema
        temas = db.query(Tema).filter(Tema.id.in_(body.tema_ids)).all()
        proyecto.temas = temas

    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)

    registrar(db, "proyecto", str(proyecto.id), "creacion",
              motivo="Creación inicial", usuario_id=user["user_id"], usuario_nombre="Admin")

    return proyecto

@router.patch("/{proyecto_id}", response_model=ProyectoDetalleOut)
def actualizar_proyecto(
    proyecto_id: UUID,
    body: ProyectoUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    proyecto = db.query(ProyectoLey).filter(ProyectoLey.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    datos = body.model_dump(exclude_unset=True, exclude={"tema_ids"})
    for campo, valor in datos.items():
        setattr(proyecto, campo, valor)

    if body.tema_ids is not None:
        from app.models.proyecto import Tema
        proyecto.temas = db.query(Tema).filter(Tema.id.in_(body.tema_ids)).all()

    db.commit()
    db.refresh(proyecto)
    return proyecto

@router.patch("/{proyecto_id}/estado", response_model=ProyectoDetalleOut)
def cambiar_estado(
    proyecto_id: UUID,
    body: CambioEstadoCreate,
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    proyecto = db.query(ProyectoLey).filter(ProyectoLey.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if proyecto.estado == body.estado_nuevo:
        raise HTTPException(status_code=400, detail="El proyecto ya tiene ese estado")

    cambio = CambioEstado(
        proyecto_id=proyecto.id,
        estado_anterior=proyecto.estado,
        estado_nuevo=body.estado_nuevo,
        motivo=body.motivo,
        usuario_id=user["user_id"],
        usuario_nombre=user.get("nombre", "Admin"),
        created_at=datetime.utcnow(),
    )

    proyecto.estado = body.estado_nuevo
    db.add(cambio)
    db.commit()
    db.refresh(proyecto)
    return proyecto
