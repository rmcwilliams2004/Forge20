# Use Python 3.10 as the base
FROM python:3.10-slim

# Install system tools needed for 3D physics and Git
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the cloud
WORKDIR /app

# Copy your requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Genesis (The Physics Muscle)
RUN pip install genesis-world 

# Copy all your project files (server.py, GenesisService.py, etc.)
COPY . .

# Tell the cloud to run your Foundry server
EXPOSE 8080
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]