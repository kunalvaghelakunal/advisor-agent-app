-- Optional: Postgres schema for RAG using Gemini embeddings later.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rag_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  full_text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(768), -- Gemini text-embedding-004 has 768 dims
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, source, source_id)
);

CREATE INDEX IF NOT EXISTS rag_item_embedding_idx
  ON rag_item USING ivfflat (embedding vector_cosine_ops);
