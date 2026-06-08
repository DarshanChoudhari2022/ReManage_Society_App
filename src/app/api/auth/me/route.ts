import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/api-cache";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cache user lookup for 30s — this endpoint is called by layout on every navigation
  // but the user data almost never changes within a session
  const cacheKey = `auth-me:${session.userId}`;

  const user = await cached(cacheKey, async () => {
    return prisma.user.findUnique({
      where: { id: session.userId },
      include: { society: true, flat: { select: { flatNumber: true } } },
    });
  }, 30_000);

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      societyId: user.societyId,
      flatId: user.flatId,
      flatNumber: user.flat?.flatNumber,
      society: user.society,
      joinCode: user.society?.joinCode,
    },
  });
}
