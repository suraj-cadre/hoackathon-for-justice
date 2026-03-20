import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Enum,
    ForeignKey,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class ContractStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    FAILED = "failed"


class IssueType(str, enum.Enum):
    AMBIGUOUS_LANGUAGE = "ambiguous_language"
    VAGUE_TIMEFRAME = "vague_timeframe"
    UNDEFINED_TERM = "undefined_term"
    MISSING_QUANTITY = "missing_quantity"
    UNCLEAR_OBLIGATION = "unclear_obligation"
    MISSING_CLAUSE = "missing_clause"
    OTHER = "other"


class Severity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title = Column(String(500), nullable=False)
    original_text = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=True)
    status = Column(
        Enum(ContractStatus, values_callable=lambda x: [e.value for e in x]),
        default=ContractStatus.UPLOADED,
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    analysis_results = relationship(
        "AnalysisResult", back_populates="contract", cascade="all, delete-orphan"
    )


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    contract_id = Column(
        Integer,
        ForeignKey("contracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    model_used = Column(String(100), nullable=False)
    summary = Column(Text, nullable=True)
    risk_score = Column(Integer, default=0)
    total_issues = Column(Integer, default=0)
    analysis_duration_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    contract = relationship("Contract", back_populates="analysis_results")
    findings = relationship(
        "DisputeFinding", back_populates="analysis_result", cascade="all, delete-orphan"
    )


class DisputeFinding(Base):
    __tablename__ = "dispute_findings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(
        Integer,
        ForeignKey("analysis_results.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    clause_text = Column(Text, nullable=False)
    issue_type = Column(
        Enum(IssueType, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        index=True,
    )
    severity = Column(
        Enum(Severity, values_callable=lambda x: [e.value for e in x]), nullable=False
    )
    explanation = Column(Text, nullable=False)
    suggested_revision = Column(Text, nullable=True)
    clause_start = Column(Integer, nullable=True)
    clause_end = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    analysis_result = relationship("AnalysisResult", back_populates="findings")
