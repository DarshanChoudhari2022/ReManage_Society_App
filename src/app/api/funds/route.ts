import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requireFinanceAccess() {
  const session = await getSession();
  if (!session?.societyId) return { error: "Unauthorized", status: 401, session: null };
  if (!["chairman", "treasurer"].includes(session.role)) {
    return { error: "Finance access required", status: 403, session: null };
  }
  return { error: null, status: 200, session };
}

export async function GET() {
  const { error, status, session } = await requireFinanceAccess();
  if (error) return Response.json({ error }, { status });

  const funds = await prisma.fundAccount.findMany({
    where: { societyId: session!.societyId },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 10 },
    },
    orderBy: { name: "asc" },
  });

  return Response.json(funds);
}

export async function POST(request: Request) {
  const { error, status, session } = await requireFinanceAccess();
  if (error) return Response.json({ error }, { status });

  const body = await request.json();
  const { name, type, description, initialBalance } = body;

  const balance = parseFloat(initialBalance || "0");
  if (!name) {
    return Response.json({ error: "Fund name is required" }, { status: 400 });
  }
  if (!Number.isFinite(balance) || balance < 0) {
    return Response.json({ error: "Opening balance cannot be negative" }, { status: 400 });
  }

  const fund = await prisma.fundAccount.create({
    data: {
      societyId: session!.societyId,
      name,
      type: type || "maintenance",
      description: description || null,
      balance,
    },
  });

  // Create initial transaction if balance > 0
  if (balance > 0) {
    await prisma.fundTransaction.create({
      data: {
        fundId: fund.id,
        type: "credit",
        amount: balance,
        description: "Opening balance",
        balanceAfter: balance,
        createdBy: session!.name,
      },
    });
  }

  return Response.json(fund, { status: 201 });
}
