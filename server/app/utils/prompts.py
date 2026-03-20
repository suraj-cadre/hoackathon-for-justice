SYSTEM_PROMPT = """You are a legal contract analyst AI. Your job is to identify potentially disputable, ambiguous, or legally risky clauses in contracts. You must be thorough but precise — only flag genuine issues that could lead to disputes between parties.

For each issue you find, you MUST respond with valid JSON."""

CLAUSE_ANALYSIS_PROMPT = """Analyze the following contract clause for potential disputes, ambiguities, or risks.

CLAUSE:
\"\"\"
{clause_text}
\"\"\"

{rag_context}

For each issue found, classify it as one of these types:
- ambiguous_language: Words or phrases that can be interpreted in multiple ways
- vague_timeframe: Time references that lack specific dates or durations (e.g., "few days", "soon", "promptly", "reasonable time", "within approximately")
- undefined_term: Important terms used without clear definition (e.g., "best efforts", "material breach")
- missing_quantity: Quantities, amounts, or thresholds that are vague or missing (e.g., "approximately", "adequate"), INCLUDING unlimited/uncapped obligations like unlimited revisions, unlimited changes, etc.
- unclear_obligation: Obligations where the responsible party, specific actions, scope, or limits are not clearly identified (e.g., "as required", "as needed", "as requested", "services as directed")
- other: Any other issue that could lead to a dispute

Rate severity as:
- high: Likely to cause a dispute; missing critical specifics
- medium: Could cause confusion; should be clarified
- low: Minor ambiguity; good practice to clarify

CRITICAL — You MUST flag ALL of the following patterns. These are NOT acceptable in contracts:
1. VAGUE TIME: "reasonable time", "promptly", "soon", "in due course", "timely manner", "within approximately X days" — flag as vague_timeframe (high severity)
2. OPEN-ENDED SCOPE: "as required", "as needed", "as requested", "as directed", "services as required by the Client" — flag as unclear_obligation (high severity). The scope of work must be specific and bounded.
3. UNLIMITED OBLIGATIONS: If revisions, changes, modifications, or support have NO stated limit or cap (e.g., "make necessary revisions as requested" with no maximum number), flag as missing_quantity (high severity). Contracts must specify a maximum number of revisions or iterations.
4. VAGUE TERMS: "reasonable", "adequate", "appropriate", "material", "best efforts", "substantial", "approximately" — flag as ambiguous_language or undefined_term
5. UNILATERAL TERMINATION: If either party can terminate "at any time" without notice period, cause, or consequences — flag as unclear_obligation (medium severity)

Be thorough and aggressive. When in doubt, FLAG IT. A contract that sounds informal or casual is likely full of issues. Every clause should be scrutinized for precision.

Respond ONLY with a JSON array. Each element must have these fields:
- "issue_type": one of the types listed above
- "severity": "high", "medium", or "low"
- "explanation": brief explanation of why this is an issue
- "suggested_revision": concrete rewritten text that fixes the issue

If the clause has absolutely NO ambiguity or issues, respond with an empty JSON array: []

Example response format:
[
  {{
    "issue_type": "vague_timeframe",
    "severity": "high",
    "explanation": "The phrase 'within a reasonable time' does not specify an exact number of days, which could lead to disputes about when payment must be made.",
    "suggested_revision": "within 15 business days of invoice submission"
  }},
  {{
    "issue_type": "missing_quantity",
    "severity": "high",
    "explanation": "The clause requires the Freelancer to make 'necessary revisions as requested' with no cap. This creates an unlimited obligation that could be exploited.",
    "suggested_revision": "The Freelancer agrees to make up to 3 rounds of revisions within the project scope."
  }}
]

Respond with ONLY the JSON array, no other text."""

CONTRACT_SUMMARY_PROMPT = """You analyzed a contract and found the following results. Generate a comprehensive summary.

CONTRACT TITLE: {title}

TOTAL ISSUES FOUND: {total_issues}
RISK SCORE: {risk_score}/100

HIGH SEVERITY: {high_count}
MEDIUM SEVERITY: {medium_count}
LOW SEVERITY: {low_count}

FINDINGS DETAILS:
{findings_detail}

FULL CONTRACT TEXT (first 3000 chars):
\"\"\"
{contract_excerpt}
\"\"\"

Respond ONLY with a JSON object (no markdown, no extra text) with these fields:
- "overview": A 2-3 sentence overall assessment of the contract quality
- "strengths": An array of 3-5 strings, each describing something the contract does well (e.g., clear IP ownership, proper confidentiality clause, defined scope). Find genuine positives even if there are many issues.
- "concerns": An array of strings, each describing a key concern or risk area found. Summarize the most important issues grouped logically. If no issues found, use an empty array.
- "recommendation": A 1-2 sentence actionable recommendation for the contract parties

Example:
{{
  "overview": "This software development agreement covers key areas but contains several ambiguous terms that could lead to disputes.",
  "strengths": ["Clear intellectual property assignment to the Client", "Includes confidentiality protections", "Defines a dispute resolution process"],
  "concerns": ["Timeline uses vague terms like 'few days' and 'soon' instead of specific dates", "Compensation amount is approximate rather than fixed"],
  "recommendation": "Both parties should negotiate specific dates, exact payment amounts, and define key terms like 'best efforts' before signing."
}}

Respond with ONLY the JSON object."""

RAG_CONTEXT_TEMPLATE = """Here are similar known dispute patterns for reference:

{patterns}

Use these patterns as guidance for identifying similar issues in the clause above."""

RAG_PATTERN_TEMPLATE = """Pattern: {pattern_name}
Category: {category}
Description: {description}
Bad example: {example_bad}
Good example: {example_good}"""

MISSING_CLAUSES_PROMPT = """You are a legal contract analyst. Review the ENTIRE contract below and identify important clauses or provisions that are MISSING from this contract.

FULL CONTRACT TEXT:
\"\"\"
{contract_text}
\"\"\"

Check whether the contract includes the following essential elements. Flag each one that is MISSING or inadequate:

1. **Dispute Resolution** — How will disputes be resolved? (arbitration, mediation, litigation, jurisdiction). If absent, this is HIGH severity.
2. **Limitation of Liability** — Is there a cap on damages or liability? If absent in a commercial contract, flag it.
3. **Confidentiality / NDA** — Are there confidentiality obligations? Flag if missing and the contract involves proprietary information or trade secrets.
4. **Intellectual Property Ownership** — Who owns the work product? Critical for service/freelance contracts. Flag if missing.
5. **Indemnification** — Are there indemnification provisions? Flag if missing in a commercial contract.
6. **Force Majeure** — Does the contract address unforeseeable events? Flag if missing.
7. **Notice Requirements** — How should formal notices be delivered? Flag if missing.
8. **Payment Terms Detail** — Are payment milestones, late fees, or invoice procedures specified? Flag if payment section exists but lacks detail.
9. **Termination Consequences** — What happens upon termination? (payment for work done, return of materials, survival clauses). Flag if termination clause exists but lacks consequences.
10. **Scope Boundaries** — Is there a clear boundary on what is and isn't included in the scope? Flag if scope is open-ended.

Only flag clauses that are genuinely MISSING or seriously inadequate. Do not flag items that are present and reasonably addressed.

Respond ONLY with a JSON array. Each element must have these fields:
- "issue_type": "missing_clause"
- "severity": "high", "medium", or "low"
- "explanation": what clause is missing and why it matters
- "suggested_revision": the full suggested clause text to add to the contract

If all essential clauses are present, respond with an empty JSON array: []

Example:
[
  {{
    "issue_type": "missing_clause",
    "severity": "high",
    "explanation": "The contract has no dispute resolution clause. Without specifying arbitration, mediation, or court jurisdiction, parties have no agreed-upon mechanism for resolving disagreements, which can lead to costly and prolonged litigation.",
    "suggested_revision": "Dispute Resolution: Any dispute arising out of or relating to this Agreement shall first be submitted to mediation administered by [mediation body]. If mediation fails, the dispute shall be resolved by binding arbitration under the rules of [arbitration body], in [city/jurisdiction]."
  }}
]

Respond with ONLY the JSON array, no other text."""
