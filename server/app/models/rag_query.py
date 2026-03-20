from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, func

from app.core.database import Base


class RagQuery(Base):
    __tablename__ = "rag_queries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    query_text = Column(Text, nullable=False)
    matched_pattern_ids = Column(JSON, nullable=True)
    model_used = Column(String(100), nullable=True)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
