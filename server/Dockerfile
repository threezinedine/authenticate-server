# Use the official Python lightweight image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/server

# Install system dependencies required for cryptography (RS256) and MySQL clients
RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    pkg-config \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install --no-cache-dir uv

# Create the working directory
WORKDIR /app

# Copy the pyproject.toml and uv.lock files
COPY pyproject.toml uv.lock ./

# Install dependencies utilizing uv (without development groups)
RUN uv sync --no-dev --all-extras

# Copy the main server application code
COPY . /app

# Expose the application port
EXPOSE 8000

# Start the FastAPI server using uvicorn via uv run
CMD ["uv", "run", "server.py"]
