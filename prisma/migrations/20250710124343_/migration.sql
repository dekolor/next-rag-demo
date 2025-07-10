-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "Chunk" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,

    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("id")
);
