import { streamText } from "ai";
import { openRouter } from "@/lib/openai";
import { NextRequest } from "next/server";
import { retrieve, buildPrompt } from "@/lib/rag";
import { getSessionId } from "@/middleware/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const userMsg = messages.at(-1)?.content || "";
  const sessionId = await getSessionId();

  await prisma.message.create({
    data: { role: "user", content: userMsg, sessionId: sessionId! },
  })

  const chunks = await retrieve(userMsg);
  const prompt = buildPrompt(userMsg, chunks);

  let result;
  const sources = chunks.map((chunk, i) => ({
    id: i + 1,
    content: chunk.content
  }));

  try {
    result = streamText({
      model: openRouter(process.env.OPENROUTER_MODEL!),
      temperature: 0.3,
      messages: prompt,
      async onFinish({ text }) {
        await prisma.message.create({
          data: { 
            role: "assistant", 
            content: JSON.stringify({
              text,
              sources
            }), 
            sessionId: sessionId! 
          }
        })
      }
    });
  } catch (err) {
    console.error("LLM error ⇒", err);
    return new Response("Upstream LLM error", { status: 500 });
  }

  return result.toDataStreamResponse();
}
