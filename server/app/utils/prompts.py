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
- vague_timeframe: Time references that lack specific dates or durations (e.g., "few days", "soon", "promptly")
- undefined_term: Important terms used without clear definition (e.g., "best efforts", "material breach")
- missing_quantity: Quantities, amounts, or thresholds that are vague or missing (e.g., "approximately", "adequate")
- unclear_obligation: Obligations where the responsible party or specific actions are not clearly identified
- other: Any other issue that could lead to a dispute

Rate severity as:
- high: Likely to cause a dispute; missing critical specifics
- medium: Could cause confusion; should be clarified
- low: Minor ambiguity; good practice to clarify

Be thorough — even seemingly minor ambiguities like "promptly", "reasonable", "adequate", "appropriate", "as needed", "from time to time", "best efforts", or "approximately" ARE genuine issues that should be flagged. Contracts must be precise.

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
    "explanation": "The phrase 'in a few days' does not specify an exact number of days, which could lead to disputes about when the obligation must be fulfilled.",
    "suggested_revision": "within 5 business days"
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
