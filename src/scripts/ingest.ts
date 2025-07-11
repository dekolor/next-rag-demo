import * as fs from "node:fs/promises";
import * as path from "node:path";
import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import { PrismaClient } from "../generated/prisma";
import { embedMany } from "../lib/embeddings";

// --- config -------------------------------------------------
const DOCS_DIR = path.join(process.cwd(), "public", "docs");
const CHUNK_SIZE = 1_000; // chars
const CHUNK_OVERLAP = 200;
// ------------------------------------------------------------

// Initialize Prisma client directly
const prisma = new PrismaClient();

async function* walkMarkdown(dir: string): AsyncGenerator<string> {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkMarkdown(full);
    else if (/\.(md|mdx)$/.test(entry.name)) yield full;
  }
}

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
    i += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

// Convert markdown AST to plain text
function extractTextFromMarkdown(markdown: string): string {
  const processor = remark().use(remarkParse).use(remarkMdx);
  const tree = processor.parse(markdown);

  let text = "";
  visit(tree, (node) => {
    if (node.type === "text") {
      text += node.value + " ";
    } else if (node.type === "inlineCode") {
      text += node.value + " ";
    } else if (node.type === "code") {
      text += node.value + " ";
    }
  });

  // Clean up extra whitespace and normalize
  return text.replace(/\s+/g, " ").trim();
}

async function main() {
  console.time("ingest");

  try {
    // Check if directory exists
    await fs.access(DOCS_DIR);
  } catch {
    console.error(`Directory ${DOCS_DIR} does not exist`);
    process.exit(1);
  }

  for await (const file of walkMarkdown(DOCS_DIR)) {
    console.log(`Processing: ${file}`);

    try {
      const raw = await fs.readFile(file, "utf8");

      // Extract plain text from markdown
      const plain = extractTextFromMarkdown(raw);

      if (!plain.trim()) {
        console.log(`Skipping empty file: ${file}`);
        continue;
      }

      const chunks = chunkText(plain);
      console.log(`Generated ${chunks.length} chunks from ${file}`);

      const batches = [];
      for (let i = 0; i < chunks.length; i += 32) {
        batches.push(chunks.slice(i, i + 32));
      }

      for (const batch of batches) {
        try {
          const vectors = await embedMany(batch); // returns number[][]

          // Process each chunk individually to handle duplicates
          for (let i = 0; i < batch.length; i++) {
            const content = batch[i];
            const embedding = vectors[i];

            try {
              // Check if chunk already exists using raw SQL
              const existing = await prisma.$queryRaw`
                SELECT id FROM "Chunk" WHERE content = ${content} LIMIT 1
              `;

              if (
                !existing ||
                (Array.isArray(existing) && existing.length === 0)
              ) {
                // Insert new chunk using raw SQL
                await prisma.$executeRaw`
                  INSERT INTO "Chunk" (content, embedding) 
                  VALUES (${content}, ${embedding}::vector)
                `;
              }
            } catch (error) {
              // Handle duplicate key errors gracefully
              if (
                error instanceof Error &&
                error.message.includes("unique constraint")
              ) {
                console.log(
                  `Chunk already exists, skipping: ${content.substring(
                    0,
                    50
                  )}...`
                );
              } else {
                console.error(`Error creating chunk: ${error}`);
              }
            }
          }
        } catch (error) {
          console.error(`Error processing batch from ${file}:`, error);
          // Continue with next batch instead of failing completely
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
      // Continue with next file instead of failing completely
    }
  }

  console.timeEnd("ingest");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
