from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx

from app.core.database import get_db
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health/live")
async def liveness():
    return {"status": "alive", "app": settings.APP_NAME}


@router.get("/health/ready")
async def readiness(db: Session = Depends(get_db)):
    checks = {"db": False, "ollama": False}

    # Check database
    try:
        db.execute(text("SELECT 1"))
        checks["db"] = True
    except Exception:
        checks["db"] = False

    # Check Ollama (non-blocking, optional)
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            checks["ollama"] = resp.status_code == 200
    except Exception:
        checks["ollama"] = False

    status = "ready" if checks["db"] else "degraded"
    return {"status": status, "checks": checks}
