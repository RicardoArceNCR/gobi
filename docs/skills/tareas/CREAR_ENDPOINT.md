# TAREA: Crear un endpoint FastAPI

> Sigue estos pasos en orden. No saltarse ninguno.

---

## Paso 1 — Definir el schema de entrada/salida

```python
# app/schemas/{entidad}.py

from pydantic import BaseModel
from typing import Optional
from uuid import UUID

# Schema de salida (lo que devuelve el endpoint)
class MiEntidadOut(BaseModel):
    id:     UUID
    nombre: str
    campo:  str

    model_config = {"from_attributes": True}  # OBLIGATORIO para leer desde ORM

# Schema de entrada para POST
class MiEntidadCreate(BaseModel):
    nombre: str
    campo:  str

# Schema de entrada para PATCH (todos opcionales)
class MiEntidadUpdate(BaseModel):
    nombre: Optional[str] = None
    campo:  Optional[str] = None
```

---

## Paso 2 — Escribir el endpoint en el router

```python
# app/routers/{entidad}.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from datetime import datetime                           # ← necesario si registras en bitácora

from app.database import get_db
from app.models.{entidad} import MiModelo
from app.schemas.{entidad} import MiEntidadOut, MiEntidadCreate, MiEntidadUpdate
from app.schemas.common import PaginatedResponse
from app.core.auth import get_current_user, require_admin
from app.services.bitacora import registrar

router = APIRouter(prefix="/{entidades}", tags=["{entidades}"])


# GET lista — público
@router.get("", response_model=PaginatedResponse[MiEntidadOut])
def listar(
    busqueda: Optional[str] = None,
    page:     int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(MiModelo)
    if busqueda:
        q = q.filter(MiModelo.nombre.ilike(f"%{busqueda}%"))

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()

    return {"items": items, "total": total, "page": page,
            "page_size": page_size, "total_pages": -(-total // page_size)}


# GET detalle — público
@router.get("/{id}", response_model=MiEntidadOut)
def obtener(id: UUID, db: Session = Depends(get_db)):
    obj = db.query(MiModelo).filter(MiModelo.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    return obj


# POST crear — solo admin
@router.post("", response_model=MiEntidadOut, status_code=201)
def crear(
    body: MiEntidadCreate,
    db:   Session = Depends(get_db),
    user  = Depends(require_admin),
):
    obj = MiModelo(**body.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    registrar(db, "{entidad}", str(obj.id), "creacion",
              motivo="Creación", usuario_id=user["user_id"],
              usuario_nombre=user.get("nombre", "Admin"))
    return obj


# PATCH editar — solo admin
@router.patch("/{id}", response_model=MiEntidadOut)
def actualizar(
    id:   UUID,
    body: MiEntidadUpdate,
    db:   Session = Depends(get_db),
    user  = Depends(require_admin),
):
    obj = db.query(MiModelo).filter(MiModelo.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")

    for campo, valor in body.model_dump(exclude_unset=True).items():
        setattr(obj, campo, valor)

    db.commit()
    db.refresh(obj)
    return obj


# DELETE — solo admin (opcional)
@router.delete("/{id}", status_code=204)
def eliminar(
    id:   UUID,
    db:   Session = Depends(get_db),
    user  = Depends(require_admin),
):
    obj = db.query(MiModelo).filter(MiModelo.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    db.delete(obj)
    db.commit()
```

---

## Paso 2b — Endpoint de cambio de estado (si aplica)

Para entidades con máquina de estados (como `ProyectoLey`), el cambio de estado
va en un endpoint separado con su propio schema. Requiere importar el modelo
de historial y `datetime`.

```python
# Agregar en app/schemas/{entidad}.py
class CambioEstadoCreate(BaseModel):
    estado_nuevo: str           # usar Enum si el modelo lo tiene
    motivo:       str           # mínimo 10 caracteres — validar en frontend y backend

# Agregar en app/routers/{entidad}.py
from app.models.{entidad} import MiModelo, HistorialEstado   # ← modelo de historial
from app.schemas.{entidad} import CambioEstadoCreate

@router.patch("/{id}/estado", response_model=MiEntidadOut)
def cambiar_estado(
    id:   UUID,
    body: CambioEstadoCreate,
    db:   Session = Depends(get_db),
    user  = Depends(require_admin),
):
    obj = db.query(MiModelo).filter(MiModelo.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No encontrado")
    if obj.estado == body.estado_nuevo:
        raise HTTPException(status_code=400, detail="El objeto ya tiene ese estado")

    historial = HistorialEstado(
        entidad_id      = obj.id,
        estado_anterior = obj.estado,
        estado_nuevo    = body.estado_nuevo,
        motivo          = body.motivo,
        usuario_id      = user["user_id"],
        usuario_nombre  = user.get("nombre", "Admin"),
        created_at      = datetime.utcnow(),
    )
    obj.estado = body.estado_nuevo
    db.add(historial)
    db.commit()
    db.refresh(obj)
    return obj
```

---

## Paso 3 — Registrar el router en main.py

```python
# app/main.py
from app.routers import {entidad}

app.include_router({entidad}.router)
```

---

## Paso 4 — Crear la migración

```bash
alembic revision --autogenerate -m "agregar_tabla_{entidad}"
alembic upgrade head
```

---

## Paso 5 — Verificar en /docs

```
http://localhost:8000/docs
Buscar el tag "{entidades}" y probar los endpoints.
```

---

## Checklist

```
[ ] Schema Out con model_config = {"from_attributes": True}
[ ] Schema Create con campos requeridos
[ ] Schema Update con todos los campos Optional
[ ] CambioEstadoCreate si la entidad tiene estados
[ ] Imports completos en el router: datetime, modelos de historial si aplica
[ ] Endpoint GET lista con paginación y filtros
[ ] Endpoint GET detalle con 404
[ ] Endpoint POST con Depends(require_admin) y bitácora
[ ] Endpoint PATCH edición con model_dump(exclude_unset=True)
[ ] Endpoint PATCH /estado si la entidad tiene máquina de estados
[ ] Router registrado en main.py
[ ] Migración creada y aplicada
[ ] Verificado en /docs
```
