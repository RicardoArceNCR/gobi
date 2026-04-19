# TAREA: Crear una migración con Alembic

> Sigue estos pasos cada vez que cambies el modelo de datos.

---

## Cuándo crear una migración

```
✅ Agregar una tabla nueva
✅ Agregar una columna a tabla existente
✅ Cambiar el tipo de una columna
✅ Agregar un índice
✅ Agregar una restricción unique
✅ Agregar una tabla de unión (many-to-many)
❌ Cambiar lógica de negocio (eso no va en migración)
```

---

## Paso 1 — Cambiar el modelo SQLAlchemy

```python
# app/models/proyecto.py — ejemplo: agregar campo "prioridad"

class ProyectoLey(Base):
    __tablename__ = "proyectos_ley"
    # ... columnas existentes ...

    # NUEVO CAMPO
    prioridad = Column(String(20), nullable=True, default=None)
```

---

## Paso 2 — Verificar que el modelo está importado en env.py

```python
# alembic/env.py — deben estar TODOS los modelos
from app.database import Base
from app.models import proyecto    # ← asegurarse que está aquí
from app.models import diputado
from app.models import comision
from app.models import bitacora

target_metadata = Base.metadata
```

---

## Paso 3 — Generar la migración automática

```bash
alembic revision --autogenerate -m "agregar_prioridad_a_proyectos"
```

Esto crea un archivo en `alembic/versions/xxxx_agregar_prioridad_a_proyectos.py`.

---

## Paso 4 — Revisar el archivo generado

```python
# alembic/versions/xxxx_agregar_prioridad_a_proyectos.py

def upgrade() -> None:
    op.add_column("proyectos_ley",
        sa.Column("prioridad", sa.String(20), nullable=True)
    )

def downgrade() -> None:
    op.drop_column("proyectos_ley", "prioridad")
```

**Verificar que:**
- `upgrade()` hace lo que esperas
- `downgrade()` lo revierte correctamente
- Los nombres de tabla son correctos (`proyectos_ley`, no `proyectoley`)

---

## Paso 5 — Aplicar la migración

```bash
alembic upgrade head
```

---

## Ejemplos de migraciones comunes

### Agregar columna NOT NULL con default
```python
def upgrade():
    # Agregar como nullable primero
    op.add_column("proyectos_ley",
        sa.Column("prioridad", sa.String(20), nullable=True)
    )
    # Poblar datos existentes
    op.execute("UPDATE proyectos_ley SET prioridad = 'normal' WHERE prioridad IS NULL")
    # Hacer NOT NULL
    op.alter_column("proyectos_ley", "prioridad", nullable=False)

def downgrade():
    op.drop_column("proyectos_ley", "prioridad")
```

### Agregar índice
```python
def upgrade():
    op.create_index("ix_proyectos_estado", "proyectos_ley", ["estado"])

def downgrade():
    op.drop_index("ix_proyectos_estado", "proyectos_ley")
```

### Agregar tabla de unión (many-to-many)
```python
def upgrade():
    op.create_table(
        "proyecto_tema",
        sa.Column("proyecto_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("proyectos_ley.id"), primary_key=True),
        sa.Column("tema_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("temas.id"), primary_key=True),
    )

def downgrade():
    op.drop_table("proyecto_tema")
```

### Agregar columna Enum
```python
def upgrade():
    # Crear el tipo primero en PostgreSQL
    op.execute("CREATE TYPE valorvoto AS ENUM ('a_favor', 'en_contra', 'abstencion', 'ausente')")
    op.add_column("votos",
        sa.Column("valor", sa.Enum("a_favor", "en_contra", "abstencion", "ausente",
                                    name="valorvoto"), nullable=False)
    )

def downgrade():
    op.drop_column("votos", "valor")
    op.execute("DROP TYPE valorvoto")
```

---

## Comandos útiles

```bash
# Ver estado actual de la DB
alembic current

# Ver historial de migraciones
alembic history --verbose

# Revertir la última migración
alembic downgrade -1

# Revertir hasta una migración específica
alembic downgrade abc123def456

# Revertir todo (cuidado en producción)
alembic downgrade base

# Ver el SQL que ejecutaría sin aplicarlo
alembic upgrade head --sql
```

---

## Checklist

```
[ ] Modelo SQLAlchemy actualizado
[ ] Modelo importado en alembic/env.py
[ ] alembic revision --autogenerate ejecutado
[ ] Archivo de migración revisado (upgrade y downgrade correctos)
[ ] alembic upgrade head ejecutado
[ ] alembic current muestra "head"
[ ] Endpoint o query que usa el nuevo campo probado en /docs
```

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Migración vacía generada | Modelo no importado en env.py | Importar el módulo en alembic/env.py |
| `target_metadata is None` | Base no asignada en env.py | `target_metadata = Base.metadata` |
| `column already exists` | Migración aplicada dos veces | Verificar con `alembic current` |
| `relation does not exist` | Migración no aplicada | `alembic upgrade head` |
| Error en producción al hacer upgrade | Migración con DEFAULT faltante | Agregar default antes de hacer NOT NULL |