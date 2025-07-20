import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
    console.log("Received body in /api/check-user-like:", body);
  } catch (e) {
    return NextResponse.json({ hasLiked: false, likeData: null, error: "Invalid or missing JSON body" }, { status: 200 });
  }

  try {
    // Accept both aiToolId/userId and toolId/userEmail for flexibility
    const aiToolId = body.aiToolId || body.toolId;
    const userId = body.userId;
    const userEmail = body.userEmail;
    if (!aiToolId || (!userId && !userEmail)) {
      // If missing, return default response instead of error
      return NextResponse.json({ hasLiked: false, likeData: null, error: "AI Tool ID and User ID or Email are required" }, { status: 200 });
    }

    // Check if user has already liked this tool
    const query = userId
      ? `*[_type == "userLike" && userId == $userId && aiToolId._ref == $aiToolId][0]`
      : `*[_type == "userLike" && userEmail == $userEmail && aiToolId._ref == $aiToolId][0]`;
    const params = userId ? { userId, aiToolId } : { userEmail, aiToolId };
    const existingLike = await client.fetch(query, params);

    return NextResponse.json({ 
      hasLiked: !!existingLike,
      likeData: existingLike || null
    });
  } catch (error) {
    console.error("Error checking user like:", error);
    return NextResponse.json({ hasLiked: false, likeData: null, error: "Failed to check user like" }, { status: 200 });
  }
} 

export async function DELETE(request: NextRequest) {
  try {
    const { aiToolId, usefulWebsiteId, userId } = await request.json();
    if (!userId || (!aiToolId && !usefulWebsiteId)) {
      return NextResponse.json({ error: "User ID and either AI Tool ID or Useful Website ID are required" }, { status: 400 });
    }
    let query = '*[_type == "userLike" && userId == $userId';
    let params: any = { userId };
    if (aiToolId) {
      query += ' && aiToolId._ref == $itemId]';
      params.itemId = aiToolId;
    } else {
      query += ' && usefulWebsiteId._ref == $itemId]';
      params.itemId = usefulWebsiteId;
    }
    const likeDoc = await client.fetch(query, params);
    if (!likeDoc || likeDoc.length === 0) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 });
    }
    const deleted = await client.delete(likeDoc[0]._id);
    return NextResponse.json({ success: true, deletedId: deleted._id });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
} 