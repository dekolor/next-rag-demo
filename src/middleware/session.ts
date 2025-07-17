import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { jwtVerify, SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.COOKIE_SECRET);

export async function getSessionId() {
    const cookie = (await cookies()).get("chat_session")?.value;
    if (cookie) {
        try {
            const { payload } =  await jwtVerify<{ sid: string }>(cookie, SECRET);
            return payload.sid;
        } catch (error) {
            console.error("Invalid session cookie:", error);
            return null;
        }
    }

    const { id } = await prisma.chatSession.create({ data: {}});

    const jwt = await new SignJWT({ sid: id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);

    (await cookies()).set("chat_session", jwt, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
    return id;
}