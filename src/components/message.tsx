import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export function Message({ role, content }: Props) {
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
            // If it's a citation link, render as Badge
            if (href?.startsWith("#citation-")) {
              return (
                <Badge className="mx-1 p-1" aria-label="citation">
                  {children}
                </Badge>
              );
            }
            // Otherwise, render normal link
            return <a href={href}>{children}</a>;
          },
        }}
      >
        {withBadges}
      </ReactMarkdown>
    </div>
  );
}
