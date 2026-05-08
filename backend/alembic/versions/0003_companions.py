"""companions json column on characters

Revision ID: 0003
Revises: 0002
Create Date: 2026-05-08

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("characters", schema=None) as batch:
        batch.add_column(
            sa.Column(
                "companions",
                sa.JSON(),
                nullable=False,
                server_default="[]",
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("characters", schema=None) as batch:
        batch.drop_column("companions")
