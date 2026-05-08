"""npc_roster + injuries + dice_log on chars; manifest on ships

Revision ID: 0005
Revises: 0004
Create Date: 2026-05-08

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("characters", schema=None) as batch:
        batch.add_column(sa.Column("npc_roster", sa.JSON(), nullable=False, server_default="[]"))
        batch.add_column(sa.Column("injuries", sa.JSON(), nullable=False, server_default="[]"))
        batch.add_column(sa.Column("dice_log", sa.JSON(), nullable=False, server_default="[]"))

    with op.batch_alter_table("ships", schema=None) as batch:
        batch.add_column(
            sa.Column(
                "manifest",
                sa.JSON(),
                nullable=False,
                server_default='{"crew": [], "cargo": [], "prisoners": []}',
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("ships", schema=None) as batch:
        batch.drop_column("manifest")
    with op.batch_alter_table("characters", schema=None) as batch:
        batch.drop_column("dice_log")
        batch.drop_column("injuries")
        batch.drop_column("npc_roster")
