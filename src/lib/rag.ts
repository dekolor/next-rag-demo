import { prisma } from "@/lib/db";
import { embedMany } from "@/lib/embeddings";
import type { Chunk } from "@/generated/prisma";

const TOP_K = 6;

export async function retrieve(query: string): Promise<Chunk[]> {
  const [vector] = await embedMany([query]);

  // pgvector cosine-distance search (closest first)
  return prisma.$queryRaw<Chunk[]>`
    SELECT id, content
    FROM "Chunk"
    ORDER BY embedding <-> ${"[" + vector.join(",") + "]"}::vector
    LIMIT ${TOP_K};
  `;
}

/** Build the prompt with inline citations like [1], [2] … */
export function buildPrompt(question: string, chunks: Chunk[]) {
  const sources = chunks
    .map((c, i) => `[${i + 1}] ${c.content.trim()}`)
    .join("\n\n");

  return [
    {
      role: "system" as const,
      content:
        "You are an AI assistant. Answer strictly from the provided sources. Cite them like [1].",
    },
    {
      role: "user" as const,
      content: `Sources:\n\n${sources}\n\nQuestion: ${question}`,
    },
  ];
}
