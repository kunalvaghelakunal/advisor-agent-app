# AI Agent for Financial Advisors (Gemini Edition)

This is a minimal, Render-ready, **working demo** with:
- **Frontend**: Next.js chat UI
- **Backend**: FastAPI
- **LLM**: Google Gemini (via `google-generativeai`)
- Optional Postgres schema for future RAG (pgvector)

> This base version focuses on a working chat loop using **Gemini**. You can extend it with Gmail/Calendar/HubSpot later.

## Quick Start (Local)

### Backend
```bash
cd api
python -m venv .venv && source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
export GEMINI_API_KEY=YOUR_KEY_HERE
uvicorn main:app --reload
```

### Frontend
```bash
cd web
npm install
export NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:3000

## Deploy on Render

1. Create **Web Service** for backend (`/api`)
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port 8000`
   - Env: `GEMINI_API_KEY`

2. Create **Web Service** for frontend (`/web`)
   - Build: `npm ci && npm run build`
   - Start: `npm start`
   - Env: `NEXT_PUBLIC_API_URL=https://<your-backend>.onrender.com`

## Env Vars
- `GEMINI_API_KEY` (backend)
- `NEXT_PUBLIC_API_URL` (frontend)

## Folder Structure
```
advisor-agent-app/
├── api/
│   ├── main.py
│   ├── requirements.txt
│   └── lib/
│       ├── llm.py
│       └── tools.py
├── web/
│   ├── package.json
│   ├── next.config.js
│   ├── styles/globals.css
│   └── pages/
│       ├── _app.tsx
│       └── index.tsx
└── README.md
```

## Optional: Postgres + pgvector schema
See `api/schema.sql` if you want to add RAG later. Update `embedding vector(768)` for Gemini embeddings (text-embedding-004).
