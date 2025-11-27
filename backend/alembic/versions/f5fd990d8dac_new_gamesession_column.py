"""new GameSession column

Revision ID: f5fd990d8dac
Revises: 32f0f00be381
Create Date: 2025-11-24 20:40:55.387157

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f5fd990d8dac'
down_revision: Union[str, Sequence[str], None] = '32f0f00be381'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
