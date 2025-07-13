import { NextRequest, NextResponse } from "next/server";
import { syncFirebaseUserToSanity } from "@/lib/actions";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await syncFirebaseUserToSanity(body);
  return NextResponse.json(user);
} 