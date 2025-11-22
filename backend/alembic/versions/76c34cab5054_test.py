"""test

Revision ID: 76c34cab5054
Revises: eb39829ff610
Create Date: 2025-11-22 10:05:20.210956

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '76c34cab5054'
down_revision: Union[str, Sequence[str], None] = 'eb39829ff610'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
