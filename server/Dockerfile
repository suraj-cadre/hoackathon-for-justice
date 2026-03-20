## ---- Stage 1: Build the React frontend ----
FROM node:20-slim AS frontend

WORKDIR /build
COPY client/package.json client/package-lock.json* ./
RUN npm ci
COPY client/ .
RUN npx tsc -b && npx vite build --outDir /static

## ---- Stage 2: Python API server ----
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for mysqlclient/pymysql and PDF parsing
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc default-libmysqlclient-dev curl zstd && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server/ .

# Copy the built frontend from stage 1
COPY --from=frontend /static ./static

EXPOSE 8080

# Start Ollama in the background, pull models, then start the app
COPY server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
