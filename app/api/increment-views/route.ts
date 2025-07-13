import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";

export async function POST(request: NextRequest) {
  try {
    const { id, views } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "AI Tool ID is required" }, { status: 400 });
    }

    // Increment views
    const updatedViews = (views || 0) + 1;
    
    await writeClient
      .patch(id)
      .set({ views: updatedViews })
      .commit();

    return NextResponse.json({ success: true, views: updatedViews });
  } catch (error) {
    console.error("Error incrementing views:", error);
    return NextResponse.json({ error: "Failed to increment views" }, { status: 500 });
  }
} 