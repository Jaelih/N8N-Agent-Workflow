FROM python:3.11

WORKDIR /app

# System dependencies (audio + ML stability)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    libsndfile1 \
    portaudio19-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip tools
RUN pip install --upgrade pip setuptools wheel

# Copy requirements first (cache optimization)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Create audio directory
RUN mkdir -p /app/audio

# Expose FastAPI port
EXPOSE 8000

# Run app (production mode)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]