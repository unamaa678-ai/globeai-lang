-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to Product for RAG-based retrieval
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Approximate nearest-neighbour index for fast similarity search
CREATE INDEX IF NOT EXISTS product_embedding_idx
  ON "Product"
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
