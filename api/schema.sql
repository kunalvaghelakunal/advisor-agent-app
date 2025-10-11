-- Postgres schema for full version (Gemini embeddings 768 dims)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS app_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oauth_connection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  scope TEXT,
  expires_at TIMESTAMPTZ,
  extra JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rag_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  full_text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, source, source_id)
);
CREATE INDEX IF NOT EXISTS rag_item_embedding_idx
  ON rag_item USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS chat_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_session(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT,
  tool_name TEXT,
  tool_args JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ongoing_instruction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,
  instruction TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  input JSONB NOT NULL,
  state JSONB DEFAULT '{}'::jsonb,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trigger_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
