"use client";
import { useChat } from "@ai-sdk/react";
import { Message } from "@/components/message";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
    });

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Next.js RAG Demo</h1>

      <div className="space-y-3 ">
        {messages.map((m) => (
          <Message
            key={m.id}
            role={m.role as "user" | "assistant"}
            content={m.content}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about Next.js docs…"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} size="icon" aria-label="Submit">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
