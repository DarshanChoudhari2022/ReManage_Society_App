import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";


import {
  buildDeprecationHeaders,
  isNestShimEnabled,
  jsonWithHeaders,
  passThroughRateLimitHeaders,
  proxyNestJson,
} from "@/lib/api/nest-proxy";
import { shimOrFallback } from "@/lib/api/nest-shim";

const LEGACY_ROUTE = "/api/staff";
const NEST_GET = "/api/v1/operations/staff/list";
const NEST_POST = "/api/v1/operations/staff/create";

async function legacyGET() {
  try {
    const session = await getSession();
    if (!session?.societyId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.domesticStaff.findMany({
      where: { societyId: session!.societyId },
      include: {
        flatLinks: {
          where: { isActive: true },
          include: { flat: { select: { flatNumber: true, wing: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(staff);
  } catch {
    return Response.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

async function legacyPOST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.societyId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, category, photoUrl, idProofType, idProofUrl, flatIds, schedule, agreedMonthlyPay } =
      await request.json();

    if (!name || !phone || !category) {
      return Response.json({ error: "Name, phone and category required" }, { status: 400 });
    }

    // Generate unique 4-digit entry code
    const entryCode = String(Math.floor(1000 + Math.random() * 9000));
    const monthlyPay = Number(agreedMonthlyPay || 0);

    const staff = await prisma.domesticStaff.create({
      data: {
        societyId: session!.societyId,
        name,
        phone,
        category,
        photoUrl: photoUrl || null,
        idProofType: idProofType || null,
        idProofUrl: idProofUrl || null,
        entryCode,
        flatLinks: flatIds?.length
          ? {
              create: flatIds.map((flatId: string) => ({
                flatId,
                schedule: schedule || null,
                agreedMonthlyPay: Number.isFinite(monthlyPay) && monthlyPay > 0 ? monthlyPay : null,
              })),
            }
          : undefined,
      },
      include: {
        flatLinks: {
          include: { flat: { select: { flatNumber: true, wing: true } } },
        },
      },
    });

    return Response.json(staff);
  } catch {
    return Response.json({ error: "Failed to create staff" }, { status: 500 });
  }
}

export const GET = shimOrFallback({ legacyRoute: "/api/staff", nestPath: "/api/v1/operations/staff", method: "GET" }, legacyGET);
export const POST = shimOrFallback({ legacyRoute: "/api/staff", nestPath: "/api/v1/operations/staff", method: "POST" }, legacyPOST);
