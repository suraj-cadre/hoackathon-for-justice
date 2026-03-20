import json
import logging
import time
from typing import Optional

from sqlalchemy.orm import Session

from app.models.contract import (
    Contract,
    ContractStatus,
    AnalysisResult,
    DisputeFinding,
    IssueType,
    Severity,
)
from app.services.ai_service import ai_service
from app.services.rag_service import rag_service
from app.services.email_service import email_service
from app.utils.contract_parser import split_into_clauses
from app.utils.prompts import (
    SYSTEM_PROMPT,
    CLAUSE_ANALYSIS_PROMPT,
    CONTRACT_SUMMARY_PROMPT,
    MISSING_CLAUSES_PROMPT,
)

logger = logging.getLogger(__name__)

SEVERITY_WEIGHTS = {"high": 10, "medium": 5, "low": 2}
VALID_ISSUE_TYPES = {e.value for e in IssueType}
VALID_SEVERITIES = {e.value for e in Severity}


class ContractAnalyzer:
    async def analyze(
        self,
        db: Session,
        contract_id: int,
        notify_email: Optional[str] = None,
    ) -> AnalysisResult:
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            raise ValueError(f"Contract {contract_id} not found")

        # Update status
        contract.status = ContractStatus.ANALYZING
        db.commit()

        start_time = time.time()

        try:
            # Split contract into clauses
            clauses = split_into_clauses(contract.original_text)
            logger.info(f"Contract {contract_id}: split into {len(clauses)} clauses")

            # Create analysis result record
            analysis = AnalysisResult(
                contract_id=contract_id,
                model_used=ai_service.chat_model,
            )
            db.add(analysis)
            db.commit()
            db.refresh(analysis)

            all_findings = []

            for clause_text, start, end in clauses:
                findings = await self._analyze_clause(
                    db, analysis.id, clause_text, start, end
                )
                all_findings.extend(findings)

            # Analyze whole contract for missing clauses
            missing_findings = await self._analyze_missing_clauses(
                db, analysis.id, contract.original_text
            )
            all_findings.extend(missing_findings)

            # Compute risk score
            risk_score = self._compute_risk_score(all_findings)

            # Generate AI-powered summary
            summary = await self._generate_summary(
                contract.title, contract.original_text, all_findings, risk_score
            )

            # Update analysis result
            analysis.risk_score = risk_score
            analysis.total_issues = len(all_findings)
            analysis.summary = summary
            analysis.analysis_duration_ms = int((time.time() - start_time) * 1000)

            contract.status = ContractStatus.ANALYZED
            db.commit()

            # Send email if requested
            if notify_email:
                severity_counts = {}
                for f in all_findings:
                    sev = (
                        f.severity.value if hasattr(f.severity, "value") else f.severity
                    )
                    severity_counts[sev] = severity_counts.get(sev, 0) + 1

                email_service.send_analysis_report(
                    db=db,
                    to_email=notify_email,
                    contract_title=contract.title,
                    risk_score=risk_score,
                    total_issues=len(all_findings),
                    summary=summary,
                    findings_by_severity=severity_counts,
                )

            logger.info(
                f"Contract {contract_id} analyzed: "
                f"{len(all_findings)} issues, risk_score={risk_score}"
            )
            return analysis

        except Exception as e:
            contract.status = ContractStatus.FAILED
            db.commit()
            logger.error(f"Analysis failed for contract {contract_id}: {e}")
            raise

    async def _analyze_clause(
        self,
        db: Session,
        analysis_id: int,
        clause_text: str,
        clause_start: int,
        clause_end: int,
    ) -> list[DisputeFinding]:
        # Get RAG context
        _, rag_context = await rag_service.find_similar_patterns(db, clause_text)

        # Build prompt
        prompt = CLAUSE_ANALYSIS_PROMPT.format(
            clause_text=clause_text,
            rag_context=rag_context,
        )

        # Call AI
        try:
            response = await ai_service.generate(prompt, system_prompt=SYSTEM_PROMPT)
        except Exception as e:
            logger.error(f"AI generation failed for clause: {e}")
            return []

        # Parse response
        findings = self._parse_findings(
            response, analysis_id, clause_text, clause_start, clause_end
        )

        # Persist findings
        for finding in findings:
            db.add(finding)
        db.commit()

        return findings

    async def _analyze_missing_clauses(
        self,
        db: Session,
        analysis_id: int,
        contract_text: str,
    ) -> list[DisputeFinding]:
        """Analyze the whole contract for missing essential clauses."""
        prompt = MISSING_CLAUSES_PROMPT.format(
            contract_text=contract_text[:5000],
        )

        try:
            response = await ai_service.generate(prompt, system_prompt=SYSTEM_PROMPT)
        except Exception as e:
            logger.error(f"AI generation failed for missing clauses analysis: {e}")
            return []

        findings = self._parse_findings(
            response, analysis_id, "[Whole Contract — Missing Clause]", 0, 0
        )

        for finding in findings:
            db.add(finding)
        db.commit()

        return findings

    def _parse_findings(
        self,
        ai_response: str,
        analysis_id: int,
        clause_text: str,
        clause_start: int,
        clause_end: int,
    ) -> list[DisputeFinding]:
        findings = []

        # Extract JSON from response (handle markdown code blocks)
        cleaned = ai_response.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            # Remove first and last lines (``` markers)
            lines = [l for l in lines if not l.strip().startswith("```")]
            cleaned = "\n".join(lines)

        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError:
            # Try to find JSON array in the response
            start_idx = ai_response.find("[")
            end_idx = ai_response.rfind("]")
            if start_idx != -1 and end_idx != -1:
                try:
                    parsed = json.loads(ai_response[start_idx : end_idx + 1])
                except json.JSONDecodeError:
                    logger.warning(
                        f"Could not parse AI response as JSON: {ai_response[:200]}"
                    )
                    return []
            else:
                logger.warning(
                    f"No JSON array found in AI response: {ai_response[:200]}"
                )
                return []

        if not isinstance(parsed, list):
            parsed = [parsed]

        for item in parsed:
            if not isinstance(item, dict):
                continue

            issue_type = item.get("issue_type", "other")
            severity = item.get("severity", "medium")

            # Validate enums
            if issue_type not in VALID_ISSUE_TYPES:
                issue_type = "other"
            if severity not in VALID_SEVERITIES:
                severity = "medium"

            finding = DisputeFinding(
                analysis_id=analysis_id,
                clause_text=clause_text,
                issue_type=IssueType(issue_type),
                severity=Severity(severity),
                explanation=item.get("explanation", ""),
                suggested_revision=item.get("suggested_revision"),
                clause_start=clause_start,
                clause_end=clause_end,
            )
            findings.append(finding)

        return findings

    def _compute_risk_score(self, findings: list[DisputeFinding]) -> int:
        total = 0
        for f in findings:
            sev = f.severity.value if hasattr(f.severity, "value") else f.severity
            total += SEVERITY_WEIGHTS.get(sev, 2)
        return min(total, 100)

    async def _generate_summary(
        self,
        title: str,
        contract_text: str,
        findings: list[DisputeFinding],
        risk_score: int,
    ) -> str:
        severity_counts: dict[str, int] = {}
        for f in findings:
            sev = f.severity.value if hasattr(f.severity, "value") else f.severity
            severity_counts[sev] = severity_counts.get(sev, 0) + 1

        findings_detail = ""
        for i, f in enumerate(findings, 1):
            issue = (
                f.issue_type.value if hasattr(f.issue_type, "value") else f.issue_type
            )
            sev = f.severity.value if hasattr(f.severity, "value") else f.severity
            findings_detail += (
                f"{i}. [{sev.upper()}] {issue}: {f.explanation}\n"
                f"   Clause: {f.clause_text[:120]}...\n\n"
            )

        if not findings_detail:
            findings_detail = (
                "No specific issues were flagged by clause-level analysis."
            )

        prompt = CONTRACT_SUMMARY_PROMPT.format(
            title=title,
            total_issues=len(findings),
            risk_score=risk_score,
            high_count=severity_counts.get("high", 0),
            medium_count=severity_counts.get("medium", 0),
            low_count=severity_counts.get("low", 0),
            findings_detail=findings_detail,
            contract_excerpt=contract_text[:3000],
        )

        try:
            response = await ai_service.generate(prompt, system_prompt=SYSTEM_PROMPT)
            # Parse JSON
            cleaned = response.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                lines = [l for l in lines if not l.strip().startswith("```")]
                cleaned = "\n".join(lines)
            start_idx = cleaned.find("{")
            end_idx = cleaned.rfind("}")
            if start_idx != -1 and end_idx != -1:
                cleaned = cleaned[start_idx : end_idx + 1]
            parsed = json.loads(cleaned)
            return json.dumps(parsed)
        except Exception as e:
            logger.warning(f"AI summary generation failed, using fallback: {e}")
            # Fallback summary
            fallback = {
                "overview": (
                    f"Analysis found {len(findings)} potential issue(s) with a risk score of {risk_score}/100."
                    if findings
                    else "No significant dispute risks were identified in this contract."
                ),
                "strengths": ["Contract covers standard agreement sections"],
                "concerns": [f.explanation for f in findings[:5]] if findings else [],
                "recommendation": (
                    "Review flagged clauses and add specific terms where ambiguity exists."
                    if findings
                    else "The contract appears well-drafted. Consider a legal review for additional assurance."
                ),
            }
            return json.dumps(fallback)


contract_analyzer = ContractAnalyzer()
