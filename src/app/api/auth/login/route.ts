import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { authRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { headers } from "next/headers";

// Retry helper for transient PgBouncer / connection errors
async function findUserWithRetry(email: string, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await prisma.user.findUnique({ where: { email } });
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      throw err;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (!authRateLimit(ip)) {
      return Response.json(
        { error: "Too many login attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await findUserWithRetry(cleanEmail);

    if (!user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check society subscription
    if (user.societyId) {
      try {
        const society = await prisma.society.findUnique({
          where: { id: user.societyId },
          select: { subscriptionEnd: true },
        });
        if (society?.subscriptionEnd && new Date(society.subscriptionEnd) < new Date()) {
          await createSession(user);
          return Response.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role, societyId: user.societyId },
            expired: true,
          });
        }
      } catch (subErr) {
        // Don't block login if subscription check fails
        console.error("Subscription check failed (non-fatal):", subErr);
      }
    }

    await createSession(user);

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        societyId: user.societyId,
      },
    });
  } catch (error: unknown) {
    console.error("Login Error:", error instanceof Error ? error.message : error);
    return Response.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}

