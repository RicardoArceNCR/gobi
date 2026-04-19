# GOBi — Fase 2: Backend FastAPI Completo

> **Objetivo:** Construir el backend real: modelos de base de datos, endpoints, validaciones y migraciones.

> **Prerequisito:** Fase 1 completada — UI funcionando con mock data.

---

## Contexto para tu editor de IA

```
Proyecto: GOBi — plataforma de inteligencia política costarricense
Stack backend: FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL + Pydantic v2
Fase: 2 — Backend completo
Auth: Clerk (validación de JWT en endpoints protegidos)
Regla: todo endpoint que modifica datos requiere autenticación. Los de lectura son públicos.
```

---

## Setup

```bash
mkdir gobi-backend && cd gobi-backend
python -m venv venv && source venv/bin/activate

pip install fastapi uvicorn[standard] sqlalchemy alembic psycopg2-binary
pip install pydantic[email] python-dotenv clerk-backend-api
pip install python-jose[cryptography] httpx

# Estructura
mkdir -p app/{models,schemas,routers,services,core}
touch app/__init__.py app/main.py app/database.py
touch app/core/{config.py,auth.py,deps.py}
```

---

## Estructura de carpetas

```
gobi-backend/
  app/
    main.py
    database.py
    models/
      __init__.py
      base.py
      proyecto.py
      diputado.py
      comision.py
      comunicado.py
      usuario.py
      bitacora.py
    schemas/
      __init__.py
      proyecto.py
      diputado.py
      comision.py
      comunicado.py
      usuario.py
      common.py
    routers/
      __init__.py
      proyectos.py
      diputados.py
      comisiones.py
      comunicados.py
      usuarios.py
      admin.py
      ai.py
    services/
      proyectos.py
      diputados.py
      bitacora.py
    core/
      config.py
      auth.py
      deps.py
  alembic/
  .env
  requirements.txt
```

---

## Configuración base

```python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    CLERK_SECRET_KEY: str
    CLERK_JWT_ISSUER: str
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
```

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## Modelos SQLAlchemy

```python
# app/models/base.py
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.database import Base

class TimestampMixin:
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
```

```python
# app/models/diputado.py
from sqlalchemy import Column, String, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base
from app.models.base import TimestampMixin

# Tabla de unión diputado <-> comision
diputado_comision = Table(
    "diputado_comision",
    Base.metadata,
    Column("diputado_id", UUID(as_uuid=True), ForeignKey("diputados.id"), primary_key=True),
    Column("comision_id", UUID(as_uuid=True), ForeignKey("comisiones.id"), primary_key=True),
)

class Partido(Base):
    __tablename__ = "partidos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False, unique=True)
    color_hex = Column(String(7), nullable=False, default="#6b7280")
    logo_url = Column(String(500), nullable=True)

    diputados = relationship("Diputado", back_populates="partido")


class Diputado(Base, TimestampMixin):
    __tablename__ = "diputados"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(200), nullable=False)
    foto_url = Column(String(500), nullable=True)
    partido_id = Column(UUID(as_uuid=True), ForeignKey("partidos.id"), nullable=False)
    salario = Column(Integer, nullable=False, default=0)
    monto_gasolina = Column(Integer, nullable=False, default=0)
    fecha_inicio = Column(String(10), nullable=False)

    partido = relationship("Partido", back_populates="diputados")
    comisiones = relationship("Comision", secondary=diputado_comision, back_populates="miembros")
    proyectos = relationship("ProyectoLey", back_populates="proponente")
    votos = relationship("Voto", back_populates="diputado")
```

```python
# app/models/proyecto.py
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid, enum
from app.database import Base
from app.models.base import TimestampMixin

class EstadoProyecto(str, enum.Enum):
    presentado = "presentado"
    en_comision = "en_comision"
    en_debate = "en_debate"
    votado = "votado"
    aprobado = "aprobado"
    archivado = "archivado"

class ValorVoto(str, enum.Enum):
    a_favor = "a_favor"
    en_contra = "en_contra"
    abstencion = "abstencion"
    ausente = "ausente"

# Tabla de unión proyecto <-> tema
proyecto_tema = Table(
    "proyecto_tema",
    Base.metadata,
    Column("proyecto_id", UUID(as_uuid=True), ForeignKey("proyectos_ley.id"), primary_key=True),
    Column("tema_id", UUID(as_uuid=True), ForeignKey("temas.id"), primary_key=True),
)

class Tema(Base):
    __tablename__ = "temas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    color_hex = Column(String(7), nullable=False, default="#6b7280")


class ProyectoLey(Base, TimestampMixin):
    __tablename__ = "proyectos_ley"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    codigo = Column(String(20), nullable=False, unique=True, index=True)
    titulo = Column(String(500), nullable=False)
    descripcion = Column(Text, nullable=False)
    texto_completo = Column(Text, nullable=True)
    estado = Column(Enum(EstadoProyecto), nullable=False, default=EstadoProyecto.presentado)
    fecha_presentacion = Column(String(10), nullable=False)

    proponente_id = Column(UUID(as_uuid=True), ForeignKey("diputados.id"), nullable=False)
    comision_id = Column(UUID(as_uuid=True), ForeignKey("comisiones.id"), nullable=True)

    proponente = relationship("Diputado", back_populates="proyectos")
    comision = relationship("Comision", back_populates="proyectos")
    temas = relationship("Tema", secondary=proyecto_tema)
    historial = relationship("CambioEstado", back_populates="proyecto", order_by="CambioEstado.created_at")
    documentos = relationship("Documento", back_populates="proyecto")
    votos = relationship("Voto", back_populates="proyecto")


class CambioEstado(Base):
    __tablename__ = "cambios_estado"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos_ley.id"), nullable=False)
    estado_anterior = Column(Enum(EstadoProyecto), nullable=False)
    estado_nuevo = Column(Enum(EstadoProyecto), nullable=False)
    motivo = Column(Text, nullable=False)
    usuario_id = Column(String(200), nullable=False)
    usuario_nombre = Column(String(200), nullable=False)
    created_at = Column(DateTime, nullable=False)

    proyecto = relationship("ProyectoLey", back_populates="historial")


class Voto(Base):
    __tablename__ = "votos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos_ley.id"), nullable=False)
    diputado_id = Column(UUID(as_uuid=True), ForeignKey("diputados.id"), nullable=False)
    valor = Column(Enum(ValorVoto), nullable=False)

    proyecto = relationship("ProyectoLey", back_populates="votos")
    diputado = relationship("Diputado", back_populates="votos")


class Documento(Base):
    __tablename__ = "documentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    proyecto_id = Column(UUID(as_uuid=True), ForeignKey("proyectos_ley.id"), nullable=False)
    nombre = Column(String(300), nullable=False)
    url = Column(String(500), nullable=False)
    tipo = Column(String(20), nullable=False, default="pdf")
    created_at = Column(DateTime, nullable=False)

    proyecto = relationship("ProyectoLey", back_populates="documentos")
```

```python
# app/models/comision.py
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
```

```python
# app/models/bitacora.py
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
```

---

## Schemas Pydantic

```python
# app/schemas/common.py
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
```

```python
# app/schemas/proyecto.py
from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID
from app.models.proyecto import EstadoProyecto

class TemaOut(BaseModel):
    id: UUID
    nombre: str
    slug: str
    color_hex: str
    model_config = {"from_attributes": True}

class PartidoOut(BaseModel):
    id: UUID
    nombre: str
    color_hex: str
    model_config = {"from_attributes": True}

class DiputadoResumenOut(BaseModel):
    id: UUID
    nombre: str
    foto_url: Optional[str]
    partido: PartidoOut
    model_config = {"from_attributes": True}

class CambioEstadoOut(BaseModel):
    id: UUID
    estado_anterior: EstadoProyecto
    estado_nuevo: EstadoProyecto
    motivo: str
    usuario_nombre: str
    created_at: str
    model_config = {"from_attributes": True}

    @field_validator("created_at", mode="before")
    def format_date(cls, v):
        return str(v)[:10] if v else ""

class DocumentoOut(BaseModel):
    id: UUID
    nombre: str
    url: str
    tipo: str
    model_config = {"from_attributes": True}

class VotoOut(BaseModel):
    diputado_id: UUID
    diputado_nombre: str   # viene del join con Diputado en la query
    partido: str           # viene de diputado.partido.nombre (resuelto en el router)
    valor: str
    model_config = {"from_attributes": True}

class ProyectoResumenOut(BaseModel):
    id: UUID
    codigo: str
    titulo: str
    descripcion: str
    estado: EstadoProyecto
    fecha_presentacion: str
    fecha_ultimo_cambio: str   # mapeado desde updated_at del modelo (TimestampMixin)
    proponente: DiputadoResumenOut
    comision_nombre: Optional[str]
    temas: list[TemaOut]
    model_config = {"from_attributes": True}

    @field_validator("fecha_ultimo_cambio", mode="before")
    def format_updated_at(cls, v):
        # updated_at viene de TimestampMixin como datetime — convertir a string
        return str(v)[:10] if v else ""

class ProyectoDetalleOut(ProyectoResumenOut):
    historial: list[CambioEstadoOut]
    documentos: list[DocumentoOut]
    votos: list[VotoOut]

class ProyectoCreate(BaseModel):
    codigo: str
    titulo: str
    descripcion: str
    texto_completo: Optional[str] = None
    estado: EstadoProyecto = EstadoProyecto.presentado
    fecha_presentacion: str
    proponente_id: UUID
    comision_id: Optional[UUID] = None
    tema_ids: list[UUID] = []

class ProyectoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    texto_completo: Optional[str] = None
    comision_id: Optional[UUID] = None
    tema_ids: Optional[list[UUID]] = None

class CambioEstadoCreate(BaseModel):
    estado_nuevo: EstadoProyecto
    motivo: str
```

---

## Auth con Clerk

```python
# app/core/auth.py
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from clerk_backend_api import Clerk
from app.core.config import settings

security = HTTPBearer()
clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    token = credentials.credentials
    try:
        payload = clerk.verify_token(token)
        return {
            "user_id": payload["sub"],
            "rol": payload.get("public_metadata", {}).get("rol", "ciudadano"),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

async def require_admin(user=Security(get_current_user)):
    if user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de administrador")
    return user
```

---

## Routers

```python
# app/routers/proyectos.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
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
    proyecto = db.query(ProyectoLey).filter(ProyectoLey.id == proyecto_id).first()
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
```

```python
# app/routers/diputados.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.database import get_db
from app.models.diputado import Diputado

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
    return {"items": items, "total": total, "page": page, "total_pages": -(-total // page_size)}


@router.get("/{diputado_id}", response_model=DiputadoOut)
def obtener_diputado(diputado_id: UUID, db: Session = Depends(get_db)):
    d = db.query(Diputado).filter(Diputado.id == diputado_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Diputado no encontrado")
    return d
```

```python
# app/services/bitacora.py
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.bitacora import EntradaBitacora

def registrar(
    db: Session,
    entidad_tipo: str,
    entidad_id: str,
    accion: str,
    motivo: str,
    usuario_id: str,
    usuario_nombre: str,
    campo_modificado: str = None,
    valor_anterior: str = None,
    valor_nuevo: str = None,
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
    db.flush()  # no commit — el router hace commit
```

---

## Main

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import proyectos, diputados
# Los routers de comisiones y comunicados se agregan al construir esos módulos
# (ver tareas/AGREGAR_MODULO.md para el patrón completo)

app = FastAPI(title="GOBi API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(proyectos.router)
app.include_router(diputados.router)
# app.include_router(comisiones.router)   ← agregar al crear ese módulo
# app.include_router(comunicados.router)  ← agregar al crear ese módulo

@app.get("/health")
def health():
    return {"status": "ok"}
```

---

## Migraciones con Alembic

```bash
# Setup
alembic init alembic

# En alembic/env.py — agregar:
from app.database import Base
from app.models import proyecto, diputado, comision, comunicado, bitacora
target_metadata = Base.metadata

# Primera migración
alembic revision --autogenerate -m "tablas_iniciales"
alembic upgrade head

# Flujo de trabajo
alembic revision --autogenerate -m "descripcion_del_cambio"
alembic upgrade head
alembic downgrade -1   # revertir última migración
```

---

## Variables de entorno

```bash
# .env
DATABASE_URL=postgresql://usuario:password@localhost:5432/gobi_dev
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
CLERK_JWT_ISSUER=https://xxxx.clerk.accounts.dev
CORS_ORIGINS=["http://localhost:3000"]
```

---

## Correr el servidor

```bash
uvicorn app.main:app --reload --port 8000
# Docs en: http://localhost:8000/docs
```

---

## Endpoints disponibles

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | /proyectos | No | Listado paginado con filtros |
| GET | /proyectos/{id} | No | Detalle con historial y votos |
| POST | /proyectos | Admin | Crear proyecto |
| PATCH | /proyectos/{id} | Admin | Actualizar campos |
| PATCH | /proyectos/{id}/estado | Admin | Cambiar estado con motivo |
| GET | /diputados | No | Listado paginado |
| GET | /diputados/{id} | No | Perfil completo |
| GET | /comisiones | No | Listado |
| GET | /comisiones/{id} | No | Detalle con miembros y proyectos |
| GET | /comunicados | No | Feed paginado |
| GET | /bitacora | Admin | Historial de cambios |

---

## Entregable de Fase 2

- [ ] Setup FastAPI + PostgreSQL + Alembic
- [ ] Todos los modelos SQLAlchemy creados
- [ ] Primera migración aplicada
- [ ] Schemas Pydantic con validaciones
- [ ] Auth con Clerk funcionando
- [ ] Endpoints de proyectos (GET listado, GET detalle, POST, PATCH, PATCH estado)
- [ ] Endpoints de diputados (GET listado, GET detalle)
- [ ] Endpoints de comisiones
- [ ] Servicio de bitácora funcionando
- [ ] CORS configurado para el frontend
- [ ] Documentación en /docs funcionando

---

## Prompts para tu editor de IA

```
Proyecto: GOBi — plataforma cívica costarricense
Stack backend: FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, Pydantic v2
Auth: Clerk JWT (función get_current_user y require_admin en app/core/auth.py)
Servicio de bitácora disponible en app/services/bitacora.py → función registrar()

Modelos disponibles:
- ProyectoLey (app/models/proyecto.py)
- Diputado, Partido (app/models/diputado.py)
- Comision (app/models/comision.py)
- EntradaBitacora (app/models/bitacora.py)

Tarea: [describe el endpoint o feature a construir]

Reglas:
- Endpoints de lectura: sin auth
- Endpoints que modifican datos: Depends(require_admin)
- Todo cambio de estado del proyecto registra en bitácora con motivo obligatorio
- Usar db.flush() en servicios, commit() en routers
- Paginación estándar: page + page_size, respuesta tipo PaginatedResponse
```

Siguiente: GOBi_03_fase-consumo-api-frontend.md
