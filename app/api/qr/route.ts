import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u") ?? "";
  if (!u.startsWith("zcash:") || u.length > 900) {
    return new NextResponse("bad request", { status: 400 });
  }
  const svg = await QRCode.toString(u, { type: "svg", margin: 0, errorCorrectionLevel: "M" });
  return new NextResponse(svg, {
    headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=300" },
  });
}
