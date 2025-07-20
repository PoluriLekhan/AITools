import { NextRequest, NextResponse } from "next/server";
import { syncFirebaseUserToSanity } from "@/lib/actions";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { uid, email } = body || {};
  if (!uid || !email) {
    return NextResponse.json({ error: "Missing required fields: uid and email are required." }, { status: 400 });
  }
  const user = await syncFirebaseUserToSanity(body);
  return NextResponse.json(user);
} 