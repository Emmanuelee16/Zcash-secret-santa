import { NextResponse } from "next/server";
import { dbOk } from "@/lib/db";

export async function GET() {
  const ok = await dbOk();
  return NextResponse.json({ ok, service: "zcash-secret-santa" }, { status: ok ? 200 : 503 });
}
