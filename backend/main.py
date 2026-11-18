import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .routers import analyze, pdf
from .schemas.responses import HealthResponse

logger = logging.getLogger(__name__)

if settings.AI_PROVIDER.lower() == "openai" and not settings.OPENAI_API_KEY:
    logger.warning(
        "OPENAI_API_KEY is not set while AI_PROVIDER=openai."
    )

app = FastAPI(
    title="Resume & JD Matcher API",
    version="1.0.0",
    description="ATS compatibility analysis powered by GPT-4o",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)

# Routers
app.include_router(analyze.router, prefix="/api")
app.include_router(pdf.router, prefix="/api")


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
async def health():
    return HealthResponse(status="ok", version="1.0.0")


# Global error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "Not found"})


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
