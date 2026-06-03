# =============================================================================
# Nexus Backend - Production Dockerfile (FastAPI + Python)
# Multi-stage friendly, secure, and optimized.
# =============================================================================

FROM python:3.12-slim AS base

# Install system dependencies (curl for healthcheck + build deps if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user early
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# ---- Dependencies stage ----
FROM base AS deps

COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ---- Runtime stage ----
FROM base AS runner

# Copy installed packages from deps stage
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Copy application code
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

EXPOSE 8000

# Use exec form for proper signal handling
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
