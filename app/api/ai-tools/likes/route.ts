import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "AI tool ID is required" }, { status: 400 });
    }
    const tool = await client.fetch(`*[_type == "aiTool" && _id == $id][0]{likes}`, { id });
    return NextResponse.json({ likes: tool?.likes ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 });
  }
} 