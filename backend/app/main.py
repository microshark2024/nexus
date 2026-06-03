"""
Nexus Professional Platform - FastAPI Backend
Main entrypoint.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.core.config import settings
from app.api.routes.ai import router as ai_router


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Professional AI-powered collaboration backend for Nexus.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}


# Mount AI routes
app.include_router(ai_router)


# Global exception handler (simple professional)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "path": str(request.url)},
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
