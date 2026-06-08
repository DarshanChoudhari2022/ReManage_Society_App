import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { generateSocietyReceiptNumber } from "@/lib/utils";
import { logPayment, logUpdated } from "@/lib/activity-log";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/maintenance/bills/[id]">
) {
  const session = await getSession();
  if (!session?.societyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json();

  const bill = await prisma.maintenanceBill.findFirst({
    where: { id, societyId: session!.societyId },
    include: {
      flat: true,
      society: { select: { joinCode: true } },
    },
  });

  if (!bill) {
    return Response.json({ error: "Bill not found" }, { status: 404 });
  }

  if (body.action === "update_invoice") {
    if (bill.status === "paid") {
      return Response.json({ error: "Paid invoices cannot be edited. Reset payment first." }, { status: 400 });
    }

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: "Invoice amount must be greater than zero" }, { status: 400 });
    }

    const dueDate = body.dueDate ? new Date(body.dueDate) : bill.dueDate;
    const updated = await prisma.maintenanceBill.update({
      where: { id },
      data: {
        amount,
        totalAmount: amount + bill.lateFee + bill.gstAmount,
        dueDate,
        status: bill.paidAmount && bill.paidAmount > 0
          ? (bill.paidAmount >= amount + bill.lateFee + bill.gstAmount ? "paid" : "partial")
          : "pending",
      },
      include: { flat: true },
    });

    await logUpdated("bill", id, `Invoice updated - Flat ${bill.flat.flatNumber} - ${bill.period}`, {
      amount,
      dueDate: dueDate.toISOString(),
    });

    return Response.json({ bill: updated });
  }

  if (body.status === "paid" || body.status === "partial") {
    if (bill.status === "paid") {
      return Response.json({ error: "Paid invoices are locked. Receipts cannot be edited." }, { status: 400 });
    }
    const billTotal = bill.totalAmount || bill.amount + bill.lateFee + bill.gstAmount;
    const paidAmount = Number(body.paidAmount || billTotal);
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      return Response.json({ error: "Payment amount must be greater than zero" }, { status: 400 });
    }
    if (billTotal <= 0) {
      return Response.json({ error: "Invoice amount is zero. Edit invoice amount before recording payment." }, { status: 400 });
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

    const updated = await prisma.maintenanceBill.update({
      where: { id },
      data: {
        status: body.status,
        paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
        paidVia: body.paidVia || "cash",
        paidAmount,
        receiptNote: body.receiptNote || null,
        receiptNumber: bill.receiptNumber || generateSocietyReceiptNumber(bill.society.joinCode, year, sequence),
      },
      include: { flat: true },
    });

    // Audit log
    await logPayment(id, `Flat ${bill.flat.flatNumber} - ${bill.period}`, {
      amount: paidAmount,
      method: body.paidVia || "cash",
      status: body.status,
      ownerName: bill.flat.ownerName,
    });

    const committeeUsers = await prisma.user.findMany({
      where: { societyId: session!.societyId, role: { in: ["chairman", "secretary", "treasurer"] } },
      select: { id: true },
    });
    await Promise.all(committeeUsers.map((user) =>
      createNotification({
        societyId: session!.societyId,
        userId: user.id,
        type: "bill_paid",
        title: `Payment Received - Flat ${bill.flat.flatNumber}`,
        message: `₹${paidAmount} ${body.status === "partial" ? "partial payment" : "full payment"} recorded via ${(body.paidVia || "cash").toUpperCase()}.`,
        link: "/maintenance",
      })
    ));

    return Response.json({ bill: updated });
  }

  if (body.status === "pending") {
    if (bill.status === "paid") {
      return Response.json({ error: "Paid invoices are locked. Receipts cannot be reset." }, { status: 400 });
    }

    const updated = await prisma.maintenanceBill.update({
      where: { id },
      data: {
        status: "pending",
        paidAt: null,
        paidVia: null,
        paidAmount: null,
        receiptNote: null,
        receiptNumber: null,
      },
      include: { flat: true },
    });

    await logUpdated("bill", id, `Flat ${bill.flat.flatNumber} - ${bill.period}`, {
      action: "reverted to pending",
    });

    return Response.json({ bill: updated });
  }

  return Response.json({ error: "Invalid status" }, { status: 400 });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/maintenance/bills/[id]">
) {
  const session = await getSession();
  if (!session?.societyId || !["chairman", "secretary", "treasurer"].includes(session.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const bill = await prisma.maintenanceBill.findFirst({
    where: { id, societyId: session.societyId },
    include: { flat: true },
  });

  if (!bill) {
    return Response.json({ error: "Bill not found" }, { status: 404 });
  }

  if (bill.status !== "pending") {
    return Response.json({ error: "Only pending invoices can be deleted. Paid or partial invoices keep payment history." }, { status: 400 });
  }

  await prisma.maintenanceBill.delete({ where: { id } });

  await logUpdated("bill", id, `Invoice deleted - Flat ${bill.flat.flatNumber} - ${bill.period}`, {
    amount: bill.totalAmount || bill.amount + bill.lateFee + bill.gstAmount,
    status: bill.status,
  });

  return Response.json({ success: true });
}
