import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth-service";
import { homeForRole } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await loginUser(formData);
  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ redirectTo: homeForRole(result.role) });
}
