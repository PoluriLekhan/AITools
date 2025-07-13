import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";

export async function POST(request: NextRequest) {
  try {
    const { id, likes } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "AI Tool ID is required" }, { status: 400 });
    }

    // Increment likes
    const updatedLikes = (likes || 0) + 1;
    
    await writeClient
      .patch(id)
      .set({ likes: updatedLikes })
      .commit();

    return NextResponse.json({ success: true, likes: updatedLikes });
  } catch (error) {
    console.error("Error incrementing likes:", error);
    return NextResponse.json({ error: "Failed to increment likes" }, { status: 500 });
  }
} 