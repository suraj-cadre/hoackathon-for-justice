from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.core.database import get_db
from app.core.config import settings
from app.models.contract import Contract, ContractStatus, AnalysisResult, DisputeFinding, IssueType, Severity
from app.schemas.contracts import (
    ContractAnalyzeRequest,
    ContractAnalyzeResponse,
    ContractResponse,
    ContractDetailResponse,
    AnalysisResultResponse,
    PaginatedFindings,
    EmailReportRequest,
)
from app.services.contract_analyzer import contract_analyzer
from app.services.email_service import email_service

router = APIRouter(prefix="/contracts", tags=["contracts"])


@router.post("/analyze", response_model=ContractAnalyzeResponse)
async def analyze_contract(
    request: ContractAnalyzeRequest,
    db: Session = Depends(get_db),
):
    # Validate size
    text_size_kb = len(request.contract_text.encode("utf-8")) / 1024
    if text_size_kb > settings.MAX_CONTRACT_SIZE_KB:
        raise HTTPException(
            status_code=400,
            detail=f"Contract text exceeds maximum size of {settings.MAX_CONTRACT_SIZE_KB}KB",
        )

    # Create contract record
    contract = Contract(
        title=request.title,
        original_text=request.contract_text,
        status=ContractStatus.UPLOADED,
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)

    # Run analysis
    try:
        await contract_analyzer.analyze(
            db=db,
            contract_id=contract.id,
            notify_email=request.user_email,
        )
        db.refresh(contract)
        return ContractAnalyzeResponse(
            id=contract.id,
            status=contract.status,
            message="Analysis completed successfully",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("", response_model=list[ContractResponse])
async def list_contracts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    contracts = (
        db.query(Contract)
        .order_by(Contract.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return contracts


@router.get("/{contract_id}/results", response_model=ContractDetailResponse)
async def get_contract_results(
    contract_id: int,
    db: Session = Depends(get_db),
):
    contract = (
        db.query(Contract)
        .options(
            joinedload(Contract.analysis_results).joinedload(AnalysisResult.findings)
        )
        .filter(Contract.id == contract_id)
        .first()
    )
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract


@router.get("/{contract_id}/findings", response_model=PaginatedFindings)
async def get_contract_findings(
    contract_id: int,
    issue_type: Optional[IssueType] = None,
    severity: Optional[Severity] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Get the latest analysis
    analysis = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.contract_id == contract_id)
        .order_by(AnalysisResult.created_at.desc())
        .first()
    )
    if not analysis:
        return PaginatedFindings(items=[], total=0, page=page, page_size=page_size)

    query = db.query(DisputeFinding).filter(DisputeFinding.analysis_id == analysis.id)

    if issue_type:
        query = query.filter(DisputeFinding.issue_type == issue_type)
    if severity:
        query = query.filter(DisputeFinding.severity == severity)

    total = query.count()
    findings = query.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedFindings(
        items=findings,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/{contract_id}/email-report")
async def email_report(
    contract_id: int,
    request: EmailReportRequest,
    db: Session = Depends(get_db),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    analysis = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.contract_id == contract_id)
        .order_by(AnalysisResult.created_at.desc())
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis results found")

    # Count findings by severity
    findings = db.query(DisputeFinding).filter(DisputeFinding.analysis_id == analysis.id).all()
    severity_counts = {}
    for f in findings:
        sev = f.severity.value if hasattr(f.severity, "value") else f.severity
        severity_counts[sev] = severity_counts.get(sev, 0) + 1

    success = email_service.send_analysis_report(
        db=db,
        to_email=request.email,
        contract_title=contract.title,
        risk_score=analysis.risk_score,
        total_issues=analysis.total_issues,
        summary=analysis.summary or "",
        findings_by_severity=severity_counts,
    )

    if success:
        return {"message": "Report sent successfully"}
    raise HTTPException(status_code=500, detail="Failed to send email report")
