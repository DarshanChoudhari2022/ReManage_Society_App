import "server-only";
import { cookies, headers } from "next/headers";
import { prisma } from "./prisma";
import { encryptSession, decryptSession } from "./session";
import type { SessionPayload } from "./session";

export type { SessionPayload };
export const encrypt = encryptSession;
export const decrypt = decryptSession;

export async function createSession(user: {
  id: string;
  societyId: string | null;
  role: string;
  name: string;
  email: string;
  flatId?: string | null;
}) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sessionToken = await encryptSession({
    userId: user.id,
    societyId: user.societyId || "",
    role: user.role,
    name: user.name,
    email: user.email,
    flatId: user.flatId || "",
    expiresAt,
  });

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const city = h.get("x-vercel-ip-city") || "local";
  const country = h.get("x-vercel-ip-country") || "local";
  const userAgent = h.get("user-agent") || "unknown";

  // Basic OS/Browser detection
  let os = "Unknown OS";
  if (userAgent.includes("Win")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "MacOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("like Mac")) os = "iOS";

  let browser = "Unknown Browser";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  // Save to DB (non-critical — don't let failures block login)
  try {
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: sessionToken,
        ipAddress: ip,
        city: city,
        country: country,
        os: os,
        browser: browser,
      },
    });
  } catch (err) {
    console.error("Failed to save UserSession (non-fatal):", err);
  }

  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return decryptSession(session);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (session) {
    try {
      await prisma.userSession.delete({
        where: { token: session },
      });
    } catch {
      // Ignored if session not in DB
    }
  }
  cookieStore.delete("session");
}

export async function getSessionUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { society: true },
  });
  return user;
}
