from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, func, Index

from app.core.database import Base


class DisputePattern(Base):
    __tablename__ = "dispute_patterns"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pattern_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    example_bad = Column(Text, nullable=False)
    example_good = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    embedding = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_dispute_patterns_description_ft", "description", mysql_prefix="FULLTEXT"),
    )
