import { streamText } from "ai";
import { openRouter } from "@/lib/openai";
import { NextRequest } from "next/server";
import { retrieve, buildPrompt } from "@/lib/rag";

// export const runtime = "edge"; // fast cold-starts

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { messages } = await req.json(); // [{ role, content }]
  const userMsg = messages.at(-1)?.content || "";

  // 1) retrieve
  const chunks = await retrieve(userMsg);

  // 2) build LLM prompt
  const prompt = buildPrompt(userMsg, chunks);

  // 3) call OpenAI with streaming using AI SDK v4
  let result;
  try {
    result = streamText({
      model: openRouter(process.env.OPENROUTER_MODEL!), // deepseek-ai/deepseek-chat
      temperature: 0.3,
      messages: prompt,
    });
  } catch (err) {
    console.error("LLM error ⇒", err);
    return new Response("Upstream LLM error", { status: 500 });
  }

  // 4) return streaming response
  return result.toDataStreamResponse();
}
