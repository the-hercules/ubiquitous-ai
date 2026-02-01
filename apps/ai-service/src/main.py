"""Main FastAPI application entry point."""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from logger.setup import setup_logging, get_logger
from middleware.logging import RequestLoggingMiddleware
from routes import health

# Initialize logging
setup_logging(log_level=settings.log_level)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Manage application lifespan events.
    
    Args:
        app: FastAPI application instance
        
    Yields:
        Control during application runtime
    """
    # Startup
    logger.info(
        "service_starting",
        service="ai-service",
        version=settings.api_version,
        port=settings.port
    )
    
    yield
    
    # Shutdown
    logger.info("service_shutting_down")


# Create FastAPI app
app = FastAPI(
    title="AI Service",
    description="Microservice for LLM-powered content generation",
    version=settings.api_version,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# Include routers
app.include_router(health.router, tags=["health"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "ai-service",
        "version": settings.api_version,
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level=settings.log_level
    )
