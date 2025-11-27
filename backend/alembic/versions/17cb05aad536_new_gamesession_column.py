"""new GameSession column

Revision ID: 17cb05aad536
Revises: 76c34cab5054
Create Date: 2025-11-24 20:35:50.882135

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '17cb05aad536'
down_revision: Union[str, Sequence[str], None] = '76c34cab5054'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
