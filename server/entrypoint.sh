#!/bin/sh
set -e

# Run database migrations and start the app
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
