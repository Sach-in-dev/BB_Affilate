# ---------- Stage 1: Build dependencies ----------
FROM python:3.12-slim AS builder

WORKDIR /build

# Install only the deps first (layer caching)
COPY requirements.txt .
RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir --upgrade pip \
    && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# ---------- Stage 2: Runtime ----------
FROM python:3.12-slim

# libpq is needed at runtime by asyncpg
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Pull the pre-built virtualenv from the builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY . .

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
