import { getSession } from "@/lib/auth";
import QRCode from "qrcode";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.societyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Generate QR code with visitor ID embedded
  const qrData = JSON.stringify({
    type: "visitor",
    id,
    societyId: session!.societyId,
    ts: Date.now(),
  });

  const qrDataUrl = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: { dark: "#1a1a2e", light: "#ffffff" },
  });

  return Response.json({ qrCode: qrDataUrl, visitorId: id });
}
