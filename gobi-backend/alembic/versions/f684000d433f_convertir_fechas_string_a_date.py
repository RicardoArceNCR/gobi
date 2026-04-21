"""convertir fechas string a date

Revision ID: f684000d433f
Revises: 38809398bb7f
Create Date: 2026-04-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f684000d433f"
down_revision: Union[str, Sequence[str], None] = "38809398bb7f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "proyectos_ley",
        "fecha_presentacion",
        type_=sa.Date(),
        postgresql_using="fecha_presentacion::date",
    )

    op.alter_column(
        "diputados",
        "fecha_inicio",
        type_=sa.Date(),
        postgresql_using="fecha_inicio::date",
    )


def downgrade() -> None:
    op.alter_column(
        "proyectos_ley",
        "fecha_presentacion",
        type_=sa.String(length=10),
        postgresql_using="to_char(fecha_presentacion, 'YYYY-MM-DD')",
    )

    op.alter_column(
        "diputados",
        "fecha_inicio",
        type_=sa.String(length=10),
        postgresql_using="to_char(fecha_inicio, 'YYYY-MM-DD')",
    )
