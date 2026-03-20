# Contract Dispute Analyzer

AI-powered contract analysis tool that identifies potentially disputable clauses — ambiguous language, vague timeframes, undefined terms, missing quantities — and suggests concrete revisions.

## Architecture

```
client/          React + TypeScript (Vite)
server/          FastAPI + MySQL + Ollama AI
```

### How It Works

1. User uploads contract text
2. Contract is split into clause-level chunks
3. Each clause is analyzed against a RAG knowledge base of known dispute patterns
4. AI identifies issues, classifies severity, and suggests revisions
5. Results are displayed with highlighted clauses and a risk score

## Prerequisites

- **Node.js** >= 18
- **Python** >= 3.11
- **MySQL** >= 8.0
- **Ollama** (for local AI inference)

## Quick Start

### 1. MySQL Setup

```sql
CREATE DATABASE hackathon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hackathon'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON hackathon_db.* TO 'hackathon'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Ollama Setup

```bash
# Install Ollama: https://ollama.com
ollama pull mistral        # Chat model
ollama pull nomic-embed-text  # Embedding model
```

### 3. Server Setup

```bash
cd server
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials and other settings

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### 4. Client Setup

```bash
cd client
npm install
cp .env.example .env.local

# Start dev server
npm run dev
```

App will be available at http://localhost:5173

## API Docs

Once the server is running, visit http://localhost:8000/docs for interactive API documentation.

## Project Structure

```
client/
├── src/
│   ├── api/           # Typed API client
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Route-level pages
│   ├── types/         # TypeScript interfaces
│   └── utils/         # Helpers
server/
├── app/
│   ├── api/v1/        # API endpoints
│   ├── core/          # Config, DB, security
│   ├── models/        # SQLAlchemy ORM models
│   ├── schemas/       # Pydantic request/response schemas
│   ├── services/      # Business logic (analyzer, email, AI, RAG)
│   └── utils/         # Contract parser, prompt templates
├── alembic/           # Database migrations
└── tests/             # Test suite
```

## Troubleshooting

- **Ollama not reachable**: Ensure `ollama serve` is running and accessible at `http://localhost:11434`
- **MySQL connection refused**: Check credentials in `.env` and that MySQL is running
- **SES email failures**: Verify sender identity in AWS SES console for region `ap-south-1`


# Terminal 1 — Backend
cd server && source venv/bin/activate
cp .env.example .env  # fill in MySQL creds
alembic upgrade head
uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd client
npm run dev
