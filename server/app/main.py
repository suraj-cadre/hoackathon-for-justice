import pathlib

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1.endpoints import health, contracts

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router)
app.include_router(contracts.router, prefix="/api/v1")

# --- Serve the React frontend build ---
STATIC_DIR = pathlib.Path(__file__).resolve().parent.parent / "static"

if STATIC_DIR.is_dir():
    app.mount(
        "/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="static-assets"
    )

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve index.html for any route not matched by the API."""
        file = STATIC_DIR / full_path
        if file.is_file():
            return FileResponse(file)
        return FileResponse(STATIC_DIR / "index.html")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred",
        },
    )
