import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function embedMany(texts: string[]): Promise<number[][]> {
  const { data } = await openai.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL!,
    input: texts,
    encoding_format: "float",
  });

  return data.map((d) => d.embedding as number[]);
}
