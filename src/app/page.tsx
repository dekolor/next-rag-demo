"use client";
import { useChat } from "@ai-sdk/react";
import { Message } from "@/components/message";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { Message as MessageType } from "@ai-sdk/react";
import fetcher from "@/lib/fetcher";
import { useState } from "react";

type ExtendedMessage = MessageType & {
  sources?: Array<{id: number, content: string}>;
};

export default function ChatPage() {
  const { data: past, mutate } = useSWR<ExtendedMessage[]>("/api/chat/history", fetcher);
  const [isClearing, setIsClearing] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } =
    useChat({
      initialMessages: past ?? [],
      api: "/api/chat",
      onFinish: async () => {
        // use setTimeout to avoid race conditions with the database write
        setTimeout(() => {
          mutate();
        }, 100);
      },
    });

  const handleClearChat = async () => {
    setIsClearing(true);
    try {
      const response = await fetch("/api/chat/clear", {
        method: "DELETE",
      });
      
      if (response.ok) {
        setMessages([]);
        mutate([]);
      } else {
        console.error("Failed to clear chat");
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Next.js RAG Demo</h1>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            disabled={isClearing || isLoading}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? "Clearing..." : "Clear Chat"}
          </Button>
        )}
      </div>

      <div className="space-y-3 ">
        {messages.map((m) => {
          const extendedMessage = m as ExtendedMessage;
          
          let sources = extendedMessage.sources;
          if (m.role === "assistant" && past) {
            const historyMessage = past.find(p => p.content === m.content && p.role === "assistant");
            if (historyMessage?.sources) {
              sources = historyMessage.sources;
            }
          }
          
          return (
            <Message
              key={m.id}
              role={m.role as "user" | "assistant"}
              content={m.content}
              sources={sources}
            />
          );
        })}
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
