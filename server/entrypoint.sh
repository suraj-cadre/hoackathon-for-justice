#!/bin/sh
set -e

# Start Ollama server in the background
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
echo "Waiting for Ollama to start..."
until curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; do
  sleep 1
done
echo "Ollama is ready."

# Pull models if not already present
echo "Ensuring models are available..."
ollama pull mistral
ollama pull nomic-embed-text
echo "Models ready."

# Run database migrations and start the app
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
