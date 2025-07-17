import { getSessionId } from "@/middleware/session";
import { prisma } from "@/lib/db";

export async function GET() {
    const sid = await getSessionId();
    const msgs = await prisma.message.findMany({
        where: {sessionId: sid!},
        orderBy: { createdAt: "asc" },
    })
    
    const parsedMsgs = msgs.map(msg => {
        if (msg.role === "assistant") {
            try {
                const parsed = JSON.parse(msg.content);
                return {
                    id: msg.id.toString(),
                    role: msg.role,
                    content: parsed.text,
                    sources: parsed.sources
                };
            } catch {
                return {
                    id: msg.id.toString(),
                    role: msg.role,
                    content: msg.content
                };
            }
        }
        return {
            id: msg.id.toString(),
            role: msg.role,
            content: msg.content
        };
    });
    
    return Response.json(parsedMsgs);
}