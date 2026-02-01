"""Request logging middleware for FastAPI."""
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from ..logger.setup import get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all incoming requests and responses."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and log details.
        
        Args:
            request: Incoming request
            call_next: Next middleware/route handler
            
        Returns:
            Response from the handler
        """
        start_time = time.time()
        
        # Log incoming request
        logger.info(
            "request_started",
            method=request.method,
            path=request.url.path,
            client_host=request.client.host if request.client else "unknown"
        )
        
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            
            # Log successful response
            logger.info(
                "request_completed",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_seconds=round(duration, 3)
            )
            
            return response
            
        except Exception as exc:
            duration = time.time() - start_time
            
            # Log error
            logger.error(
                "request_failed",
                method=request.method,
                path=request.url.path,
                duration_seconds=round(duration, 3),
                error=str(exc),
                exc_info=True
            )
            raise
