# SKILL: FastAPI

> Stack: FastAPI + SQLAlchemy 2.0 + Pydantic v2 + PostgreSQL

---

## Anatomía de un endpoint completo

```python
# app/routers/proyectos.py

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.database import get_db
from app.models.proyecto import ProyectoLey, EstadoProyecto
from app.schemas.proyecto import ProyectoResumenOut, ProyectoCreate
from app.schemas.common import PaginatedResponse
from app.core.auth import get_current_user, require_admin
from app.services.bitacora import registrar

router = APIRouter(prefix="/proyectos", tags=["proyectos"])


# GET lista — público, paginado, con filtros
@router.get("", response_model=PaginatedResponse[ProyectoResumenOut])
def listar_proyectos(
    estado:   Optional[EstadoProyecto] = None,
    tema:     Optional[str] = None,
    busqueda: Optional[str] = None,
    page:     int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(ProyectoLey)

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

    total   = q.count()
    items   = q.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items":       items,
        "total":       total,
        "page":        page,
        "page_size":   page_size,
        "total_pages": -(-total // page_size),  # ceil division
    }


# GET detalle — público
@router.get("/{proyecto_id}", response_model=ProyectoDetalleOut)
def obtener_proyecto(proyecto_id: UUID, db: Session = Depends(get_db)):
    proyecto = db.query(ProyectoLey).filter(ProyectoLey.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto


# POST crear — solo admin
@router.post("", response_model=ProyectoDetalleOut, status_code=201)
def crear_proyecto(
    body: ProyectoCreate,
    db:   Session = Depends(get_db),
    user  = Depends(require_admin),
):
    # Validar duplicado
    if db.query(ProyectoLey).filter(ProyectoLey.codigo == body.codigo).first():
        raise HTTPException(status_code=400, detail=f"Ya existe el expediente {body.codigo}")

    proyecto = ProyectoLey(**body.model_dump(exclude={"tema_ids"}))

    if body.tema_ids:
        from app.models.proyecto import Tema
        proyecto.temas = db.query(Tema).filter(Tema.id.in_(body.tema_ids)).all()

    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)

    registrar(db, "proyecto", str(proyecto.id), "creacion",
              motivo="Creación inicial",
              usuario_id=user["user_id"],
              usuario_nombre=user.get("nombre", "Admin"))

    return proyecto


# PATCH cambiar estado — solo admin, con bitácora
@router.patch("/{proyecto_id}/estado", response_model=ProyectoDetalleOut)
def cambiar_estado(
    proyecto_id: UUID,
    body: CambioEstadoCreate,
    db:   Session = Depends(get_db),
    user  = Depends(require_admin),
):
    proyecto = db.query(ProyectoLey).filter(ProyectoLey.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    if proyecto.estado == body.estado_nuevo:
        raise HTTPException(status_code=400, detail="El proyecto ya tiene ese estado")

    cambio = CambioEstado(
        proyecto_id    = proyecto.id,
        estado_anterior = proyecto.estado,
        estado_nuevo   = body.estado_nuevo,
        motivo         = body.motivo,
        usuario_id     = user["user_id"],
        usuario_nombre = user.get("nombre", "Admin"),
        created_at     = datetime.utcnow(),
    )
    proyecto.estado = body.estado_nuevo
    db.add(cambio)
    db.commit()
    db.refresh(proyecto)
    return proyecto
```

---

## Schemas Pydantic v2

```python
# app/schemas/proyecto.py
from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID
from app.models.proyecto import EstadoProyecto

# Schema de salida (Out) — para respuestas
class ProyectoResumenOut(BaseModel):
    id:                  UUID
    codigo:              str
    titulo:              str
    estado:              EstadoProyecto
    fecha_presentacion:  str
    proponente:          DiputadoResumenOut
    temas:               list[TemaOut]

    model_config = {"from_attributes": True}   # obligatorio para leer desde ORM

# Schema de entrada (Create) — para POST
class ProyectoCreate(BaseModel):
    codigo:              str
    titulo:              str
    descripcion:         str
    estado:              EstadoProyecto = EstadoProyecto.presentado
    fecha_presentacion:  str
    proponente_id:       UUID
    comision_id:         Optional[UUID] = None
    tema_ids:            list[UUID] = []

# Schema de actualización (Update) — para PATCH
class ProyectoUpdate(BaseModel):
    titulo:       Optional[str]       = None
    descripcion:  Optional[str]       = None
    comision_id:  Optional[UUID]      = None
    tema_ids:     Optional[list[UUID]] = None

# Schema paginado genérico
# app/schemas/common.py
from pydantic import BaseModel
from typing import Generic, TypeVar
T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items:       list[T]
    total:       int
    page:        int
    page_size:   int
    total_pages: int
```

---

## Modelos SQLAlchemy 2.0

```python
# app/models/proyecto.py
from sqlalchemy import Column, String, Text, Enum, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid, enum
from app.database import Base

class EstadoProyecto(str, enum.Enum):
    presentado  = "presentado"
    en_comision = "en_comision"
    en_debate   = "en_debate"
    votado      = "votado"
    aprobado    = "aprobado"
    archivado   = "archivado"

# Tabla de unión many-to-many
proyecto_tema = Table(
    "proyecto_tema", Base.metadata,
    Column("proyecto_id", UUID(as_uuid=True), ForeignKey("proyectos_ley.id"), primary_key=True),
    Column("tema_id",     UUID(as_uuid=True), ForeignKey("temas.id"),         primary_key=True),
)

class ProyectoLey(Base):
    __tablename__ = "proyectos_ley"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    codigo       = Column(String(20),  nullable=False, unique=True, index=True)
    titulo       = Column(String(500), nullable=False)
    descripcion  = Column(Text,        nullable=False)
    estado       = Column(Enum(EstadoProyecto), nullable=False, default=EstadoProyecto.presentado)

    proponente_id = Column(UUID(as_uuid=True), ForeignKey("diputados.id"), nullable=False)
    comision_id   = Column(UUID(as_uuid=True), ForeignKey("comisiones.id"), nullable=True)

    # Relaciones
    proponente = relationship("Diputado",     back_populates="proyectos")
    comision   = relationship("Comision",     back_populates="proyectos")
    temas      = relationship("Tema",         secondary=proyecto_tema)
    historial  = relationship("CambioEstado", back_populates="proyecto",
                              order_by="CambioEstado.created_at")
    votos      = relationship("Voto",         back_populates="proyecto")
    documentos = relationship("Documento",    back_populates="proyecto")
```

---

## Auth — get_current_user y require_admin

```python
# app/core/auth.py
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from clerk_backend_api import Clerk
from app.core.config import settings

security = HTTPBearer()
clerk    = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    try:
        payload = clerk.verify_token(credentials.credentials)
        return {
            "user_id": payload["sub"],
            "rol":     payload.get("public_metadata", {}).get("rol", "ciudadano"),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

async def require_admin(user = Security(get_current_user)):
    if user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol admin")
    return user
```

---

## Servicio de bitácora

```python
# app/services/bitacora.py
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.bitacora import EntradaBitacora

def registrar(
    db:              Session,
    entidad_tipo:    str,     # "proyecto" | "diputado" | "usuario"
    entidad_id:      str,
    accion:          str,     # "creacion" | "edicion" | "cambio_estado" | "eliminacion"
    motivo:          str,
    usuario_id:      str,
    usuario_nombre:  str,
    campo_modificado: str = None,
    valor_anterior:  str = None,
    valor_nuevo:     str = None,
):
    entrada = EntradaBitacora(
        entidad_tipo     = entidad_tipo,
        entidad_id       = entidad_id,
        accion           = accion,
        campo_modificado = campo_modificado,
        valor_anterior   = valor_anterior,
        valor_nuevo      = valor_nuevo,
        motivo           = motivo,
        usuario_id       = usuario_id,
        usuario_nombre   = usuario_nombre,
        created_at       = datetime.utcnow(),
    )
    db.add(entrada)
    db.flush()   # flush aquí, commit en el router
```

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `model_config = {"from_attributes": True}` faltante | Schema no lee desde ORM | Agregarlo a todos los schemas `Out` |
| `422 Unprocessable Entity` | Body no coincide con schema | Revisar `/docs` para ver qué espera el endpoint |
| `DetachedInstanceError` | Acceder a relación fuera de sesión | Usar `db.refresh()` después de commit |
| `IntegrityError` | Duplicado o FK inválida | Validar antes de insertar |
| CORS bloqueado | Origen no está en `CORS_ORIGINS` | Agregar URL en `.env` |
| Token no llega | Header `Authorization` faltante | Verificar interceptor Axios en frontend |