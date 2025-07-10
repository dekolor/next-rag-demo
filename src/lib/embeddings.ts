import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

export async function embedText(text: string) {
  const { embedding } = await embed({
    model: openai.embedding(process.env.OPENAI_EMBEDDING_MODEL!),
    value: text,
  });

  return embedding as number[];
}
