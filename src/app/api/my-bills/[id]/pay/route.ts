import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { logPayment } from "@/lib/activity-log";
import { createNotification } from "@/lib/notifications";
import { generateSocietyReceiptNumber } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/my-bills/[id]/pay">
) {
  const session = await getSession();
  if (!session?.societyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || !user.flatId) {
    return Response.json({ error: "No flat assigned" }, { status: 400 });
  }

  const bill = await prisma.maintenanceBill.findFirst({
    where: { id, societyId: session!.societyId, flatId: user.flatId },
    include: {
      flat: true,
      society: { select: { joinCode: true } },
    },
  });

  if (!bill) {
    return Response.json({ error: "Bill not found" }, { status: 404 });
  }

  if (bill.status === "paid") {
    return Response.json({ error: "Bill is already paid" }, { status: 400 });
  }

  const totalAmount = bill.totalAmount || bill.amount + bill.lateFee + bill.gstAmount;
  if (totalAmount <= 0) {
    return Response.json({ error: "Invoice amount is not set. Please contact society admin." }, { status: 400 });
  }

  // Generate receipt number
  const year = new Date().getFullYear();
  const receiptPrefix = `${bill.society.joinCode || "SOC"}-${year}`;
  const lastReceipt = await prisma.maintenanceBill.findFirst({
    where: {
      societyId: session!.societyId,
      receiptNumber: { startsWith: receiptPrefix },
    },
    orderBy: { receiptNumber: "desc" },
  });

  let sequence = 1;
  if (lastReceipt?.receiptNumber) {
    const lastSeq = parseInt(lastReceipt.receiptNumber.split("-")[2]);
    sequence = lastSeq + 1;
  }

  const receiptNumber = generateSocietyReceiptNumber(bill.society.joinCode, year, sequence);

  // Mock processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const updated = await prisma.maintenanceBill.update({
    where: { id },
    data: {
      status: "paid",
      paidAt: new Date(),
      paidVia: body.paidVia || "upi",
      paidAmount: totalAmount,
      receiptNote: body.utrNumber ? `UPI UTR: ${body.utrNumber}` : "Online Payment via App",
      receiptNumber,
    },
    include: { flat: true },
  });

  // Audit log
  await logPayment(id, `Flat ${bill.flat.flatNumber} - ${bill.period}`, {
    amount: totalAmount,
    method: body.paidVia || "upi",
    status: "paid",
    ownerName: bill.flat.ownerName,
    utrNumber: body.utrNumber || null,
  });

  const committeeUsers = await prisma.user.findMany({
    where: { societyId: session!.societyId, role: { in: ["chairman", "secretary", "treasurer"] } },
    select: { id: true },
  });
  await Promise.all(committeeUsers.map((committeeUser) =>
    createNotification({
      societyId: session!.societyId,
      userId: committeeUser.id,
      type: "bill_paid",
      title: `Online Payment Received - Flat ${bill.flat.flatNumber}`,
      message: `₹${totalAmount} received from ${user.name} via ${(body.paidVia || "upi").toUpperCase()}${body.utrNumber ? ` · UTR ${body.utrNumber}` : ""}.`,
      link: "/maintenance",
    })
  ));

  return Response.json({ bill: updated });
}
