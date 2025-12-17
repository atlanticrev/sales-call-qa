FROM python:3.10-slim

WORKDIR /app

ENV OPENBLAS_NUM_THREADS=1
ENV OMP_NUM_THREADS=1

RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Стабильный ML-стек
RUN pip install --no-cache-dir \
    numpy==1.26.4 \
    torch==2.1.2 \
    openai-whisper \
    fastapi==0.110.0 \
    uvicorn[standard]==0.29.0

RUN pip install python-multipart

COPY app.py .

EXPOSE 8001

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
