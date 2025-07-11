import { createOpenAI } from "@ai-sdk/openai";

export const openRouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL,
  // OpenRouter wants one of these two headers
  headers: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Next.js RAG Demo",
  },
});
