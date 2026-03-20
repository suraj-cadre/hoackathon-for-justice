from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.contract import IssueType, Severity, ContractStatus


# --- Request schemas ---

class ContractAnalyzeRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    contract_text: str = Field(..., min_length=10)
    user_email: Optional[str] = None


class EmailReportRequest(BaseModel):
    email: str


class FindingsFilterParams(BaseModel):
    issue_type: Optional[IssueType] = None
    severity: Optional[Severity] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


# --- Response schemas ---

class DisputeFindingResponse(BaseModel):
    id: int
    clause_text: str
    issue_type: IssueType
    severity: Severity
    explanation: str
    suggested_revision: Optional[str]
    clause_start: Optional[int]
    clause_end: Optional[int]

    class Config:
        from_attributes = True


class AnalysisResultResponse(BaseModel):
    id: int
    contract_id: int
    model_used: str
    summary: Optional[str]
    risk_score: int
    total_issues: int
    analysis_duration_ms: Optional[int]
    created_at: datetime
    findings: List[DisputeFindingResponse] = []

    model_config = {"from_attributes": True, "protected_namespaces": ()}


class ContractResponse(BaseModel):
    id: int
    title: str
    file_name: Optional[str]
    status: ContractStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContractDetailResponse(ContractResponse):
    original_text: str
    analysis_results: List[AnalysisResultResponse] = []


class ContractAnalyzeResponse(BaseModel):
    id: int
    status: ContractStatus
    message: str


class PaginatedFindings(BaseModel):
    items: List[DisputeFindingResponse]
    total: int
    page: int
    page_size: int
