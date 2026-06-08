import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logCreated } from "@/lib/activity-log";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.societyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || !user.flatId) {
    return Response.json({ error: "No flat assigned" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const history = searchParams.get("history") === "all";
  const limit = history ? 100 : 30;

  const visitors = await prisma.visitor.findMany({
    where: {
      societyId: session!.societyId,
      flatId: user.flatId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return Response.json({ visitors });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.societyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { flat: true }
    });

    if (!user || !user.flatId || !user.flat) {
      return Response.json({ error: "No flat assigned" }, { status: 400 });
    }

    const body = await request.json();
    const { visitorName, phone, purpose, expectedAt } = body;

    if (!visitorName || !purpose || !expectedAt) {
      return Response.json({ error: "Visitor name, purpose, and expected time are required" }, { status: 400 });
    }

    const passcode = Math.floor(100000 + Math.random() * 900000).toString();

    const visitor = await prisma.visitor.create({
      data: {
        societyId: session!.societyId,
        flatId: user.flatId,
        flatNumber: user.flat.flatNumber,
        visitorName,
        phone: phone || null,
        purpose,
        isPreApproved: true,
        status: "expected",
        expectedAt: new Date(expectedAt),
        passcode,
        verificationMethod: "pre_approved",
        residentResponse: "approved",
        respondedAt: new Date(),
        approvedBy: session.name,
      },
    });

    // Audit log
    await logCreated("visitor", visitor.id, `Expected: ${visitorName} → Flat ${user.flat.flatNumber}`, {
      purpose,
      isPreApproved: true,
    });

    return Response.json({ visitor, passcode }, { status: 201 });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session?.societyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user?.flatId) {
      return Response.json({ error: "No flat assigned" }, { status: 400 });
    }

    const { visitorId, action } = await request.json();
    if (!visitorId || !["approved", "rejected"].includes(action)) {
      return Response.json({ error: "Invalid approval action" }, { status: 400 });
    }

    const visitor = await prisma.visitor.findFirst({
      where: {
        id: visitorId,
        societyId: session.societyId,
        flatId: user.flatId,
        status: "expected",
      },
    });

    if (!visitor) {
      return Response.json({ error: "Visitor request not found" }, { status: 404 });
    }

    const updated = await prisma.visitor.update({
      where: { id: visitor.id },
      data: {
        residentResponse: action,
        respondedAt: new Date(),
        approvedBy: action === "approved" ? session.name : null,
        status: action === "rejected" ? "rejected" : "expected",
      },
    });

    return Response.json({
      visitor: updated,
      message: action === "approved" ? "Visitor approved for gate entry" : "Visitor rejected",
    });
  } catch {
    return Response.json({ error: "Could not update visitor request" }, { status: 500 });
  }
}
