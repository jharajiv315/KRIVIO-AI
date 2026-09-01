"""add preferred_language to users

Revision ID: 2026_09_02_add_preferred_language
Revises: 
Create Date: 2026-09-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2026_09_02_add_preferred_language'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Safely add column preferred_language if it doesn't already exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]
    if 'preferred_language' not in columns:
        op.add_column('users', sa.Column('preferred_language', sa.String(length=10), server_default='en', nullable=False))

def downgrade() -> None:
    op.drop_column('users', 'preferred_language')
