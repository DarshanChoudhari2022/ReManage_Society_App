import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBillingTargetsForSociety, targetsByFlatId } from "@/domain/billing";

export async function GET() {
  const session = await getSession();
  if (!session?.societyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user to find their flatId
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || !user.flatId) {
    return Response.json({ error: "No flat assigned to this user" }, { status: 400 });
  }

  const billingTargets = await getBillingTargetsForSociety(session.societyId);
  const targetByFlatId = targetsByFlatId(billingTargets);

  const bills = await prisma.maintenanceBill.findMany({
    where: {
      societyId: session!.societyId,
      flatId: user.flatId,
    },
    include: {
      flat: true,
      society: {
        select: {
          name: true,
          upiId: true,
          bankDetails: true,
        }
      }
    },
    orderBy: { dueDate: "desc" },
  });
  const visibleBills = bills
    .map((bill) => ({ ...bill, billingRecipient: targetByFlatId.get(bill.flatId) || null }))
    .filter((bill) => {
      if (!bill.billingRecipient) return true;
      return bill.billingRecipient.userIds.includes(session.userId);
    });

  const stats = {
    totalPending: visibleBills
      .filter((b) => b.status === "pending" || b.status === "partial")
      .reduce((acc, b) => acc + ((b.totalAmount || b.amount + b.lateFee + b.gstAmount) - (b.paidAmount || 0)), 0),
    totalPaid: visibleBills.filter((b) => b.status === "paid" || b.status === "partial").reduce((acc, b) => acc + (b.paidAmount || 0), 0),
  };

  return Response.json({ bills: visibleBills, stats });
}
