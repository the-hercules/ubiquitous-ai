# Use Python 3.13 slim image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install uv package manager
RUN pip install --no-cache-dir uv

# Copy project files
COPY apps/ai-service/pyproject.toml .
COPY apps/ai-service/src ./src

# Install dependencies using uv
RUN uv pip install --system -r pyproject.toml

# Set Python path so imports work correctly
ENV PYTHONPATH=/app/src

# Expose port
EXPOSE 8800

# Run the application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8800"]
