"""rt fields, ships, character images

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-08

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ships",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(), index=True, server_default="Unnamed Voidship"),
        sa.Column("ship_class", sa.String(), server_default=""),
        sa.Column("hull_integrity_current", sa.Integer(), server_default="0"),
        sa.Column("hull_integrity_total", sa.Integer(), server_default="0"),
        sa.Column("speed", sa.Integer(), server_default="0"),
        sa.Column("manoeuvrability", sa.Integer(), server_default="0"),
        sa.Column("detection", sa.Integer(), server_default="0"),
        sa.Column("armour", sa.Integer(), server_default="0"),
        sa.Column("turret_rating", sa.Integer(), server_default="0"),
        sa.Column("crew_population", sa.Integer(), server_default="0"),
        sa.Column("crew_rating", sa.String(), server_default="Competent"),
        sa.Column("morale_current", sa.Integer(), server_default="0"),
        sa.Column("morale_total", sa.Integer(), server_default="0"),
        sa.Column("power_used", sa.Integer(), server_default="0"),
        sa.Column("power_total", sa.Integer(), server_default="0"),
        sa.Column("space_used", sa.Integer(), server_default="0"),
        sa.Column("space_total", sa.Integer(), server_default="0"),
        sa.Column("components", sa.JSON()),
        sa.Column("weapons", sa.JSON()),
        sa.Column("background", sa.Text(), server_default=""),
        sa.Column("notes", sa.Text(), server_default=""),
    )

    op.create_table(
        "character_images",
        sa.Column("character_id", sa.Integer(), primary_key=True),
        sa.Column("data", sa.LargeBinary(), nullable=False),
        sa.Column("mime", sa.String(), nullable=False, server_default="image/jpeg"),
        sa.Column("original_data", sa.LargeBinary(), nullable=False),
        sa.Column("original_mime", sa.String(), nullable=False, server_default="image/jpeg"),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.func.current_timestamp(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["character_id"], ["characters.id"], ondelete="CASCADE"
        ),
    )

    with op.batch_alter_table("characters", schema=None) as batch:
        batch.add_column(
            sa.Column(
                "system", sa.String(), nullable=False, server_default="only_war"
            )
        )
        batch.add_column(sa.Column("career", sa.String(), nullable=True))
        batch.add_column(sa.Column("profit_factor", sa.Integer(), nullable=True))
        batch.add_column(sa.Column("ship_id", sa.Integer(), nullable=True))
        batch.create_foreign_key(
            "fk_characters_ship_id", "ships", ["ship_id"], ["id"]
        )


def downgrade() -> None:
    with op.batch_alter_table("characters", schema=None) as batch:
        batch.drop_constraint("fk_characters_ship_id", type_="foreignkey")
        batch.drop_column("ship_id")
        batch.drop_column("profit_factor")
        batch.drop_column("career")
        batch.drop_column("system")

    op.drop_table("character_images")
    op.drop_table("ships")
