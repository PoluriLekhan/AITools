import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  "lekhan2009visit@gmail.com"
].filter((email): email is string => typeof email === 'string' && !!email);

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const idToken = authHeader.replace("Bearer ", "").trim();
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (decoded.email && ADMIN_EMAILS.includes(decoded.email)) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No tool IDs provided" }, { status: 400 });
  }
  try {
    const transaction = client.transaction();
    ids.forEach((id: string) => {
      transaction.patch(id, { set: { status: "approved" } });
    });
    await transaction.commit();
    return NextResponse.json({ success: true, count: ids.length });
  } catch (err) {
    return NextResponse.json({ error: "Failed to approve tools" }, { status: 500 });
  }
}

export function GET() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function PUT() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function DELETE() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function PATCH() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}