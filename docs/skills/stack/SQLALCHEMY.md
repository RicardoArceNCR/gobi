# SKILL: SQLAlchemy 2.0 + Alembic

> Stack: SQLAlchemy 2.0 + Alembic + PostgreSQL + FastAPI

---

## Setup de base de datos

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

engine       = create_engine(settings.DATABASE_URL)
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

## Tipos de columnas más usados

```python
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, Enum, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
import uuid, enum

id      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
nombre  = Column(String(200), nullable=False)
texto   = Column(Text, nullable=True)
activo  = Column(Boolean, default=True)
orden   = Column(Integer, default=0)
fecha   = Column(DateTime, nullable=False)
estado  = Column(Enum(MiEnum), nullable=False, default=MiEnum.valor)
fk      = Column(UUID(as_uuid=True), ForeignKey("tabla.id"), nullable=False)
```

---

## Mixin de timestamps

```python
# app/models/base.py
from sqlalchemy import Column, DateTime, func

class TimestampMixin:
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(),
                        onupdate=func.now(), nullable=False)
```

---

## Relaciones

### Uno a muchos (One-to-Many)
```python
# Un partido tiene muchos diputados
class Partido(Base):
    diputados = relationship("Diputado", back_populates="partido")

class Diputado(Base):
    partido_id = Column(UUID(as_uuid=True), ForeignKey("partidos.id"), nullable=False)
    partido    = relationship("Partido", back_populates="diputados")
```

### Muchos a muchos (Many-to-Many)
```python
# Tabla de unión
proyecto_tema = Table(
    "proyecto_tema", Base.metadata,
    Column("proyecto_id", UUID(as_uuid=True), ForeignKey("proyectos_ley.id"), primary_key=True),
    Column("tema_id",     UUID(as_uuid=True), ForeignKey("temas.id"),         primary_key=True),
)

class ProyectoLey(Base):
    temas = relationship("Tema", secondary=proyecto_tema)
```

### Relación con orden
```python
historial = relationship("CambioEstado", back_populates="proyecto",
                         order_by="CambioEstado.created_at")
```

---

## Queries más usadas

```python
# Obtener uno por ID
proyecto = db.query(ProyectoLey).filter(ProyectoLey.id == id).first()
if not proyecto:
    raise HTTPException(status_code=404)

# Filtros múltiples
q = db.query(ProyectoLey)
if estado:   q = q.filter(ProyectoLey.estado == estado)
if busqueda: q = q.filter(ProyectoLey.titulo.ilike(f"%{busqueda}%"))

# Paginación
total = q.count()
items = q.offset((page - 1) * page_size).limit(page_size).all()

# Join para filtrar por relación
from app.models.proyecto import Tema, proyecto_tema
q = q.join(proyecto_tema).join(Tema).filter(Tema.slug == tema_slug)

# Verificar existencia (sin cargar el objeto completo)
existe = db.query(ProyectoLey).filter(ProyectoLey.codigo == codigo).first()

# Actualizar campos
for campo, valor in body.model_dump(exclude_unset=True).items():
    setattr(objeto, campo, valor)
db.commit()

# Asignar many-to-many
proyecto.temas = db.query(Tema).filter(Tema.id.in_(tema_ids)).all()
```

---

## Ciclo de vida de una operación

```python
# Crear
objeto = Modelo(**datos)
db.add(objeto)
db.commit()
db.refresh(objeto)   # recarga relaciones después del commit
return objeto

# Actualizar
setattr(objeto, "campo", nuevo_valor)
db.commit()
db.refresh(objeto)
return objeto

# Eliminar
db.delete(objeto)
db.commit()

# flush vs commit
db.flush()    # escribe en la transacción sin confirmar (para bitácora)
db.commit()   # confirma todo — usar en routers, no en servicios
```

---

## Alembic — migraciones

```bash
# Setup inicial (una sola vez)
alembic init alembic
```

```python
# alembic/env.py — agregar esto para que detecte los modelos
from app.database import Base
from app.models import proyecto, diputado, comision, bitacora   # importar TODOS
target_metadata = Base.metadata
```

```bash
# Crear una migración
alembic revision --autogenerate -m "descripcion_corta"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1

# Ver historial
alembic history

# Ver estado actual
alembic current
```

### Ejemplo de migración manual
```python
# alembic/versions/xxxx_agregar_campo_prioridad.py
def upgrade():
    op.add_column("proyectos_ley",
        sa.Column("prioridad", sa.String(20), nullable=True)
    )

def downgrade():
    op.drop_column("proyectos_ley", "prioridad")
```

---

## Índices importantes para GOBi

```python
# En los modelos
codigo = Column(String(20), nullable=False, unique=True, index=True)
estado = Column(Enum(EstadoProyecto), nullable=False, index=True)
nombre = Column(String(200), nullable=False, index=True)
```

```python
# O en migración
op.create_index("ix_proyectos_estado", "proyectos_ley", ["estado"])
op.create_index("ix_proyectos_codigo", "proyectos_ley", ["codigo"], unique=True)
```

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `DetachedInstanceError` | Acceder a relación después de cerrar sesión | Usar `db.refresh()` antes de devolver |
| `IntegrityError: duplicate key` | Insertar valor duplicado en campo único | Verificar existencia antes de insertar |
| Migración no detecta cambios | Modelos no importados en `env.py` | Importar todos los módulos de modelos |
| `Can't load plugin: sqlalchemy.dialects:postgres` | URL usa `postgres://` en vez de `postgresql://` | Cambiar prefijo en `DATABASE_URL` |
| Relación retorna lista vacía | Relación no eager-loaded | Agregar `joinedload` o acceder dentro de la sesión |