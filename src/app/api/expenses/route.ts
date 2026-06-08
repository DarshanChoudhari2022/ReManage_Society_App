import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { logCreated } from "@/lib/activity-log";
import { EXPENSE_CATEGORY_IDS } from "@/lib/finance-categories";

const MAX_PROOF_DATA_URL_LENGTH = 4_500_000;
const ALLOWED_PROOF_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

function fiscalYearFor(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 4 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;
}

function validateBillProof(input: {
  billProofDataUrl?: unknown;
  billProofFileName?: unknown;
  billProofFileType?: unknown;
}) {
  const billProofDataUrl = typeof input.billProofDataUrl === "string" ? input.billProofDataUrl : "";
  const billProofFileName = typeof input.billProofFileName === "string" ? input.billProofFileName.trim() : "";
  const billProofFileType = typeof input.billProofFileType === "string" ? input.billProofFileType.trim() : "";

  if (!billProofDataUrl && !billProofFileName && !billProofFileType) {
    return { billProofDataUrl: null, billProofFileName: null, billProofFileType: null };
  }

  if (!billProofDataUrl || !billProofFileName || !billProofFileType) {
    throw new Error("Bill proof file, name, and type must be uploaded together");
  }
  if (!ALLOWED_PROOF_TYPES.has(billProofFileType)) {
    throw new Error("Only JPG, PNG, WebP, or PDF bills are allowed");
  }
  if (!billProofDataUrl.startsWith(`data:${billProofFileType};base64,`)) {
    throw new Error("Invalid bill proof file");
  }
  if (billProofDataUrl.length > MAX_PROOF_DATA_URL_LENGTH) {
    throw new Error("Bill proof must be under 3 MB");
  }

  return { billProofDataUrl, billProofFileName, billProofFileType };
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.societyId || !["chairman", "secretary", "treasurer"].includes(session.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";
  const month = searchParams.get("month") || "";

  const where: Record<string, unknown> = { societyId: session!.societyId };

  if (category) where.category = category;
  if (month) {
    const [year, m] = month.split("-").map(Number);
    where.paidOn = {
      gte: new Date(year, m - 1, 1),
      lt: new Date(year, m, 1),
    };
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { paidOn: "desc" },
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return Response.json({ expenses, total });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.societyId || !["chairman", "secretary", "treasurer"].includes(session.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, amount, category, paidTo, paidOn, notes } = body;

    const parsedAmount = parseFloat(amount);
    if (!title || !amount || !category || !paidOn || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return Response.json({ error: "Title, amount, category, and date are required" }, { status: 400 });
    }
    if (!EXPENSE_CATEGORY_IDS.has(category)) {
      return Response.json({ error: "Invalid expense category" }, { status: 400 });
    }
    const proof = validateBillProof(body);

    const expenseDate = new Date(paidOn);
    const expense = await prisma.$transaction(async (tx) => {
      const created = await tx.expense.create({
        data: {
          societyId: session!.societyId,
          title: title.trim(),
          amount: parsedAmount,
          category,
          paidTo: paidTo?.trim() || null,
          paidOn: expenseDate,
          notes: notes?.trim() || null,
          netPayable: parsedAmount,
          billProofDataUrl: proof.billProofDataUrl,
          billProofFileName: proof.billProofFileName,
          billProofFileType: proof.billProofFileType,
          billProofUploadedAt: proof.billProofDataUrl ? new Date() : null,
        },
      });

      await tx.budget.updateMany({
        where: {
          societyId: session!.societyId,
          fiscalYear: fiscalYearFor(expenseDate),
          category,
        },
        data: { actual: { increment: parsedAmount } },
      });

      return created;
    });

    await logCreated("expense", expense.id, `${title} - ₹${amount}`, {
      category,
      paidTo,
      amount: parseFloat(amount),
      billProofAttached: Boolean(proof.billProofDataUrl),
    });

    return Response.json({ expense }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return Response.json({ error: message }, { status: message === "Something went wrong" ? 500 : 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session?.societyId || !["chairman", "secretary", "treasurer"].includes(session.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const expenseId = typeof body.expenseId === "string" ? body.expenseId : "";
    const action = typeof body.action === "string" ? body.action : "";

    if (!expenseId || !["verify_proof", "unverify_proof"].includes(action)) {
      return Response.json({ error: "Invalid expense action" }, { status: 400 });
    }

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, societyId: session.societyId },
    });
    if (!expense) return Response.json({ error: "Expense not found" }, { status: 404 });
    if (!expense.billProofDataUrl) {
      return Response.json({ error: "Attach a bill proof before verification" }, { status: 400 });
    }

    const updated = await prisma.expense.update({
      where: { id: expense.id },
      data: action === "verify_proof"
        ? { billProofVerifiedAt: new Date(), billProofVerifiedBy: session.name || session.email || session.role }
        : { billProofVerifiedAt: null, billProofVerifiedBy: null },
    });

    await logCreated("expense", expense.id, `${expense.title} proof ${action === "verify_proof" ? "verified" : "unverified"}`, {
      action,
      amount: expense.amount,
      category: expense.category,
    });

    return Response.json({ expense: updated });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
