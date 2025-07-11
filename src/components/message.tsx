import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export function Message({ role, content }: Props) {
  // replace [1] … with badge components
  const withBadges = content.replace(
    /\[(\d+)]/g,
    (_, i) => `<badge index="${i}" />`
  );

  return (
    <div
      className={cn("whitespace-pre-wrap", role === "user" && "font-medium")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          badge: ({ node }) => (
            <Badge className="mx-1 p-1">[{node.properties!.index}]</Badge>
          ),
        }}
      >
        {withBadges}
      </ReactMarkdown>
    </div>
  );
}
