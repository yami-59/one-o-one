"""new GameSession column

Revision ID: 32f0f00be381
Revises: 17cb05aad536
Create Date: 2025-11-24 20:39:42.212010

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "32f0f00be381"
down_revision: Union[str, Sequence[str], None] = "17cb05aad536"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
