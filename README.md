# AI Agent for Financial Advisors — FULL VERSION (Gemini)

Stack:
- **Frontend**: Next.js 14 + NextAuth (Google OAuth), responsive Chat UI
- **Backend**: FastAPI (Python), Tool-calling with **Google Gemini**
- **DB**: PostgreSQL (Render), optional `pgvector` schema (768 dims for Gemini embeddings)
- **OAuth**:
  - **Google**: Login & consent with Gmail/Calendar scopes (tokens stored via NextAuth JWT)
  - **HubSpot**: OAuth stub with backend callback and token storage

> This repo runs as-is with stubbed tool implementations. Replace stub calls with real Gmail/Calendar/HubSpot API logic when ready.

## Local Dev

### Backend
```bash
cd api
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export GEMINI_API_KEY=YOUR_KEY
export DATABASE_URL=postgresql://user:pass@host:5432/dbname  # or omit to use SQLite demo
uvicorn main:app --reload
```

### Frontend
```bash
cd web
npm install
# point UI to backend
export NEXT_PUBLIC_API_URL=http://localhost:8000
# NextAuth Google
export NEXTAUTH_URL=http://localhost:3000
export NEXTAUTH_SECRET=changeme_long_random
export GOOGLE_CLIENT_ID=...
export GOOGLE_CLIENT_SECRET=...
# Include Gmail/Calendar scopes to request consent
export GOOGLE_OAUTH_SCOPES="openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar"
npm run dev
```

Open http://localhost:3000

## Render Deployment

1. **PostgreSQL** (Render → New → PostgreSQL)
   - Optional: Enable pgvector and run `/api/schema.sql`
2. **API Web Service** (root `/api`)
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port 8000`
   - Env: `GEMINI_API_KEY`, `DATABASE_URL`
3. **WEB Web Service** (root `/web`)
   - Build: `npm ci && npm run build`
   - Start: `npm start`
   - Env:
     - `NEXT_PUBLIC_API_URL=https://<api>.onrender.com`
     - `NEXTAUTH_URL=https://<web>.onrender.com`
     - `NEXTAUTH_SECRET=<random>`
     - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
     - `GOOGLE_OAUTH_SCOPES="openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar"`

**Add** `webshookeng@gmail.com` as a **Google OAuth test user** in Google Cloud Console.

## What works now
- Google sign-in (NextAuth) and a **Connect HubSpot** flow (stubbed authorization URL and callback)
- Chat UI calling FastAPI `/chat` → Gemini response
- Tool-calling schema defined; backend exposes tool endpoints & stubs for:
  - `send_email`, `find_available_times`, `create_calendar_event`
  - `hubspot_lookup`, `hubspot_upsert`, `hubspot_add_note`
- DB schema for users/messages/instructions/tasks (see `/api/schema.sql`)

Replace stub logic in `lib/google_client.py` & `lib/hubspot_client.py` with real API calls.
