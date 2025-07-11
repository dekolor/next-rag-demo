-- enable pgvector if not already done
CREATE EXTENSION IF NOT EXISTS vector;

-- build ANN index
CREATE INDEX chunk_embedding_ivfflat ON "Chunk" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 768);