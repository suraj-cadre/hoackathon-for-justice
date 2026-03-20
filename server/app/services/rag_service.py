import logging
import time
from typing import List, Tuple

import numpy as np
from sqlalchemy.orm import Session

from app.models.dispute_pattern import DisputePattern
from app.models.rag_query import RagQuery
from app.services.ai_service import ai_service
from app.utils.prompts import RAG_CONTEXT_TEMPLATE, RAG_PATTERN_TEMPLATE

logger = logging.getLogger(__name__)


class RagService:
    async def embed_all_patterns(self, db: Session) -> int:
        """Embed all dispute patterns that don't have embeddings yet."""
        patterns = db.query(DisputePattern).filter(DisputePattern.embedding.is_(None)).all()
        count = 0
        for pattern in patterns:
            try:
                embedding = await ai_service.embed(pattern.description)
                pattern.embedding = embedding
                count += 1
            except Exception as e:
                logger.error(f"Failed to embed pattern {pattern.id}: {e}")
        db.commit()
        logger.info(f"Embedded {count} patterns")
        return count

    async def find_similar_patterns(
        self,
        db: Session,
        clause_text: str,
        top_k: int = 3,
    ) -> Tuple[List[DisputePattern], str]:
        """Find the top-k most similar dispute patterns for a clause.

        Returns (matched_patterns, formatted_context_string).
        """
        start = time.time()

        # Embed the clause
        try:
            clause_embedding = await ai_service.embed(clause_text)
        except Exception as e:
            logger.warning(f"Embedding failed, returning empty context: {e}")
            return [], ""

        # Get all patterns with embeddings
        patterns = db.query(DisputePattern).filter(DisputePattern.embedding.isnot(None)).all()
        if not patterns:
            return [], ""

        # Compute cosine similarity
        clause_vec = np.array(clause_embedding)
        scored: List[Tuple[DisputePattern, float]] = []
        for p in patterns:
            p_vec = np.array(p.embedding)
            if clause_vec.shape != p_vec.shape:
                continue
            cos_sim = float(np.dot(clause_vec, p_vec) / (np.linalg.norm(clause_vec) * np.linalg.norm(p_vec) + 1e-9))
            scored.append((p, cos_sim))

        scored.sort(key=lambda x: x[1], reverse=True)
        top_patterns = [p for p, _ in scored[:top_k]]

        # Format context string
        if top_patterns:
            pattern_strs = [
                RAG_PATTERN_TEMPLATE.format(
                    pattern_name=p.pattern_name,
                    category=p.category,
                    description=p.description,
                    example_bad=p.example_bad,
                    example_good=p.example_good,
                )
                for p in top_patterns
            ]
            context = RAG_CONTEXT_TEMPLATE.format(patterns="\n---\n".join(pattern_strs))
        else:
            context = ""

        # Log telemetry
        latency_ms = int((time.time() - start) * 1000)
        rag_log = RagQuery(
            query_text=clause_text[:500],
            matched_pattern_ids=[p.id for p in top_patterns],
            model_used=ai_service.embed_model,
            latency_ms=latency_ms,
        )
        db.add(rag_log)
        db.commit()

        return top_patterns, context


rag_service = RagService()
