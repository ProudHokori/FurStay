import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth-service";

export async function POST() {
  await logoutUser();
  return NextResponse.json({ ok: true });
}
