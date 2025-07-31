import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
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
    if (typeof decoded.email === 'string' && ADMIN_EMAILS.includes(decoded.email)) {
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
  const { tools } = await req.json();
  if (!Array.isArray(tools) || tools.length === 0) {
    return NextResponse.json({ error: "No tools provided" }, { status: 400 });
  }
  // Fetch all existing tool names and URLs for duplicate check
  const allTools = await client.fetch(`*[_type == 'aiTool']{title, toolWebsiteURL}`);
  // Fetch author by email
  const author = await client.fetch(`*[_type == 'author' && email == $email][0]{_id}`, { email: adminUser.email });
  if (!author?._id) {
    return NextResponse.json({ error: "Admin author not found in Sanity" }, { status: 400 });
  }
  let uploaded = 0;
  let skipped = 0;
  const results = [];
  for (const row of tools) {
    const aiToolName = row.aiToolName?.trim();
    const websiteUrl = row.websiteUrl?.trim();
    // Duplicate check should be done just before creation to avoid race conditions
    const freshTools = await client.fetch(`*[_type == 'aiTool']{title, toolWebsiteURL}`);
    const duplicate = freshTools.find((tool: any) =>
      (tool.title && tool.title.trim().toLowerCase() === aiToolName?.toLowerCase()) ||
      (tool.toolWebsiteURL && tool.toolWebsiteURL.trim().toLowerCase() === websiteUrl?.toLowerCase())
    );
    if (duplicate) {
      skipped++;
      results.push({ aiToolName, success: false, reason: "Duplicate name or URL" });
      continue;
    }
    // Prepare types as array
    const types = typeof row.types === "string" ? row.types.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
    try {
      await writeClient.create({
        _type: "aiTool",
        title: aiToolName,
        description: row.aiToolDescription,
        category: row.category,
        subCategory: types[0] || "",
        types,
        toolWebsiteURL: websiteUrl,
        toolImage: row.thumbnailImageUrl,
        pitch: row.pitch,
        status: "pending",
        author: { _type: "reference", _ref: author._id },
      });
      uploaded++;
      results.push({ aiToolName, success: true });
    } catch (err) {
      skipped++;
      results.push({ aiToolName, success: false, reason: "Error creating document" });
    }
  }
  return NextResponse.json({ success: true, uploaded, skipped, results });
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