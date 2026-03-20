import re
from typing import List, Tuple


def split_into_clauses(text: str) -> List[Tuple[str, int, int]]:
    """Split contract text into clause-level chunks.

    Returns a list of (clause_text, start_offset, end_offset) tuples.
    Splits on:
    - Double newlines (paragraph breaks)
    - Section headers (e.g., "1.", "Section 1:", "Article I", "SECTION 1")
    Skips empty/whitespace-only chunks.
    """
    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Split on double newlines or section-header patterns at line start
    pattern = r"(?:\n\s*\n)|(?=\n\s*(?:(?:Section|Article|SECTION|ARTICLE)\s+\w+|(?:\d+\.)\s))"
    parts = re.split(pattern, text)

    clauses: List[Tuple[str, int, int]] = []
    offset = 0

    for part in parts:
        stripped = part.strip()
        if not stripped:
            # Advance offset past whitespace
            offset += len(part)
            continue

        # Find the actual start position in the original text
        start = text.find(stripped, offset)
        if start == -1:
            start = offset
        end = start + len(stripped)

        clauses.append((stripped, start, end))
        offset = end

    # Merge very short clauses (< 20 chars) with the next one for context
    merged: List[Tuple[str, int, int]] = []
    i = 0
    while i < len(clauses):
        clause_text, start, end = clauses[i]
        if len(clause_text) < 20 and i + 1 < len(clauses):
            next_text, _, next_end = clauses[i + 1]
            merged.append((clause_text + "\n" + next_text, start, next_end))
            i += 2
        else:
            merged.append((clause_text, start, end))
            i += 1

    return merged
