import { getSessionId } from "@/middleware/session";
import { prisma } from "@/lib/db";

export async function DELETE() {
    const sessionId = await getSessionId();
    
    if (!sessionId) {
        return new Response("No session found", { status: 400 });
    }

    try {
        await prisma.message.deleteMany({
            where: { sessionId }
        });
        
        return new Response("Chat cleared successfully", { status: 200 });
    } catch (error) {
        console.error("Error clearing chat:", error);
        return new Response("Failed to clear chat", { status: 500 });
    }
}