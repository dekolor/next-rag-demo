import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

type Source = {
  id: number;
  content: string;
};

type Props = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export function Message({ role, content, sources }: Props) {
  const [showSources, setShowSources] = useState(false);
  
  const withBadges = content.replace(
    /\[(\d+)]/g,
    (_, i) => `[${i}](#citation-${i})`
  );

  return (
    <div
      className={cn(
        "whitespace-pre-wrap",
        role === "user" && "font-medium",
        role === "assistant" && "llm-response"
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith("#citation-")) {
              return (
                <Badge className="mx-1 p-1" aria-label="citation">
                  {children}
                </Badge>
              );
            }
            return <a href={href}>{children}</a>;
          },
        }}
      >
        {withBadges}
      </ReactMarkdown>
      
      {role === "assistant" && sources && sources.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-2"
          >
            {showSources ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Sources ({sources.length})
          </button>
          
          {showSources && (
            <div className="space-y-3">
              {sources.map((source) => (
                <div key={source.id} className="bg-gray-50 p-3 rounded text-sm">
                  <div className="font-medium text-gray-700 mb-1">
                    [{source.id}]
                  </div>
                  <div className="text-gray-600 line-clamp-3">
                    {source.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
