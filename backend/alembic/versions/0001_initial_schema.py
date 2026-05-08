"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-05-07

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "characters",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(), index=True),
        sa.Column("regiment", sa.String()),
        sa.Column("specialty", sa.String()),
        sa.Column("demeanour", sa.String()),
        sa.Column("ws", sa.Integer()),
        sa.Column("bs", sa.Integer()),
        sa.Column("s", sa.Integer()),
        sa.Column("t", sa.Integer()),
        sa.Column("ag", sa.Integer()),
        sa.Column("int", sa.Integer()),
        sa.Column("per", sa.Integer()),
        sa.Column("wp", sa.Integer()),
        sa.Column("fel", sa.Integer()),
        sa.Column("current_wounds", sa.Integer()),
        sa.Column("total_wounds", sa.Integer()),
        sa.Column("current_fate", sa.Integer()),
        sa.Column("total_fate", sa.Integer()),
        sa.Column("fatigue", sa.Integer(), server_default="0"),
        sa.Column("insanity", sa.Integer(), server_default="0"),
        sa.Column("corruption", sa.Integer(), server_default="0"),
        sa.Column("movement", sa.Integer(), server_default="3"),
        sa.Column("skills", sa.JSON()),
        sa.Column("weapons", sa.JSON()),
        sa.Column("talents", sa.JSON()),
        sa.Column("armour", sa.JSON()),
        sa.Column("gear", sa.String(), server_default=""),
        sa.Column("xp", sa.JSON()),
        sa.Column("inventory", sa.JSON()),
    )


def downgrade() -> None:
    op.drop_table("characters")
