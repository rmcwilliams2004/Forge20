# Use Python 3.10 as the base
FROM python:3.10-slim

# Install system dependencies needed for CadQuery OpenCASCADE B-Rep geometry, 3D physics, and Git
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libgl1 \
    libglu1-mesa \
    libglib2.0-0 \
    libxrender1 \
    libxcursor1 \
    libxft2 \
    libxinerama1 \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the cloud
WORKDIR /app

# Ensure CAD export and static media directories exist
RUN mkdir -p /app/static/cad /app/static/drawings /app/static/models

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Genesis (The Physics Muscle)
RUN pip install --no-cache-dir genesis-world || true

# Copy all project files (server.py, GenesisService.py, etc.)
COPY . .

# Tell the cloud to run your Foundry server
EXPOSE 8080
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]