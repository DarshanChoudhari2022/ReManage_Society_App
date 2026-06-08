import { getSession } from "@/lib/auth";
import { getTrialBalance } from "@/domain/accounting-engine";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.societyId || !["chairman", "secretary", "treasurer"].includes(session.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const trialBalance = await getTrialBalance({
    societyId: session.societyId,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  return Response.json({ trialBalance });
}
