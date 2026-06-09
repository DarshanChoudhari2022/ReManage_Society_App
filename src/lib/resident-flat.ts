import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/session";

export async function getResidentFlatForSession(session: SessionPayload) {
  const sessionFlatId = session.flatId?.trim();
  if (sessionFlatId) {
    const flat = await prisma.flat.findFirst({
      where: { id: sessionFlatId, societyId: session.societyId },
      select: { id: true, flatNumber: true, wing: true },
    });
    if (flat) return flat;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { flatId: true },
  });

  if (!user?.flatId) return null;

  return prisma.flat.findFirst({
    where: { id: user.flatId, societyId: session.societyId },
    select: { id: true, flatNumber: true, wing: true },
  });
}

export function isResidentRole(role: string): boolean {
  return role === "member" || role === "tenant";
}

export function isStaffManagerRole(role: string): boolean {
  return ["chairman", "secretary", "treasurer", "facility_manager"].includes(role);
}
