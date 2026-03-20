"""add missing_clause issue type

Revision ID: 003_missing_clause
Revises: 002_seed_patterns
Create Date: 2026-03-20

"""

from typing import Sequence, Union

from alembic import op

revision: str = "003_missing_clause"
down_revision: Union[str, None] = "002_seed_patterns"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # MySQL: ALTER the enum column to include the new value
    op.execute(
        "ALTER TABLE dispute_findings MODIFY COLUMN issue_type "
        "ENUM('ambiguous_language','vague_timeframe','undefined_term',"
        "'missing_quantity','unclear_obligation','missing_clause','other') NOT NULL"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE dispute_findings MODIFY COLUMN issue_type "
        "ENUM('ambiguous_language','vague_timeframe','undefined_term',"
        "'missing_quantity','unclear_obligation','other') NOT NULL"
    )
