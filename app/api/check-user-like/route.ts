import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
  try {
    const { aiToolId, userId } = await request.json();
    
    if (!aiToolId || !userId) {
      return NextResponse.json({ error: "AI Tool ID and User ID are required" }, { status: 400 });
    }

    // Check if user has already liked this tool
    const existingLike = await client.fetch(
      `*[_type == "userLike" && userId == $userId && aiToolId._ref == $aiToolId][0]`,
      { userId, aiToolId }
    );

    return NextResponse.json({ 
      hasLiked: !!existingLike,
      likeData: existingLike || null
    });
  } catch (error) {
    console.error("Error checking user like:", error);
    return NextResponse.json({ error: "Failed to check user like" }, { status: 500 });
  }
} 