"""add resolved_by to incidents

Revision ID: a3e4b7c8d9f0
Revises: f44648e549bf
Create Date: 2026-10-11 12:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3e4b7c8d9f0'
down_revision: Union[str, Sequence[str], None] = 'f44648e549bf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('incidents')]
    if 'resolved_by' not in columns:
        op.add_column('incidents', sa.Column('resolved_by', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('incidents', 'resolved_by')
