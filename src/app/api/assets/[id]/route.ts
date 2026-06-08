import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, status, session } = await requireAdmin();
  if (error) return Response.json({ error }, { status });

  const { id } = await params;
  const body = await request.json();

  const asset = await prisma.societyAsset.findFirst({
    where: { id, societyId: session!.societyId },
  });

  if (!asset) {
    return Response.json({ error: "Asset not found" }, { status: 404 });
  }

  const updated = await prisma.societyAsset.update({
    where: { id },
    data: {
      ...body,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : asset.purchaseDate,
      warrantyEnd: body.warrantyEnd ? new Date(body.warrantyEnd) : asset.warrantyEnd,
      lastMaintenanceAt: body.lastMaintenanceAt ? new Date(body.lastMaintenanceAt) : asset.lastMaintenanceAt,
      nextMaintenanceAt: body.nextMaintenanceAt ? new Date(body.nextMaintenanceAt) : asset.nextMaintenanceAt,
      purchaseAmount: body.purchaseAmount ? parseFloat(body.purchaseAmount) : asset.purchaseAmount,
      currentValue: body.currentValue ? parseFloat(body.currentValue) : asset.currentValue,
    },
  });

  return Response.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, status, session } = await requireAdmin();
  if (error) return Response.json({ error }, { status });

  const { id } = await params;

  await prisma.societyAsset.deleteMany({
    where: { id, societyId: session!.societyId },
  });

  return Response.json({ success: true });
}
