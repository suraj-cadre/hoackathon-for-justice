from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health/live")
async def liveness():
    return {"status": "alive", "app": settings.APP_NAME}


@router.get("/health/ready")
async def readiness(db: Session = Depends(get_db)):
    checks = {"db": False, "openai": False}

    # Check database
    try:
        db.execute(text("SELECT 1"))
        checks["db"] = True
    except Exception:
        checks["db"] = False

    # Check OpenAI key is configured
    checks["openai"] = bool(settings.OPENAI_API_KEY)

    status = "ready" if checks["db"] and checks["openai"] else "degraded"
    return {"status": status, "checks": checks}
