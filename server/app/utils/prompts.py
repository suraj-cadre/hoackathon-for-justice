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

Respond ONLY with a JSON array. Each element must have these fields:
- "issue_type": one of the types listed above
- "severity": "high", "medium", or "low"
- "explanation": brief explanation of why this is an issue
- "suggested_revision": concrete rewritten text that fixes the issue

If the clause has NO issues, respond with an empty JSON array: []

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

RAG_CONTEXT_TEMPLATE = """Here are similar known dispute patterns for reference:

{patterns}

Use these patterns as guidance for identifying similar issues in the clause above."""

RAG_PATTERN_TEMPLATE = """Pattern: {pattern_name}
Category: {category}
Description: {description}
Bad example: {example_bad}
Good example: {example_good}"""
