import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
  try {
    const { documentId, documentType = "aiTool", likes, userId, userEmail } = await request.json();
    
    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 });
    }

    const documentTypeQuery = documentType === "usefulWebsite" ? "usefulWebsite" : "aiTool";
    const referenceField = documentType === "usefulWebsite" ? "usefulWebsiteId" : "aiToolId";

    // Check if user has already liked this document
    const existingLike = await client.fetch(
      `*[_type == "userLike" && userId == $userId && ${referenceField}._ref == $documentId][0]`,
      { userId, documentId }
    );

    if (existingLike) {
      return NextResponse.json({ 
        error: `User has already liked this ${documentType === "usefulWebsite" ? "website" : "tool"}`,
        alreadyLiked: true 
      }, { status: 400 });
    }

    // Create user like record
    const likeRecord: any = {
      _type: "userLike",
      userId,
      userEmail,
      likedAt: new Date().toISOString()
    };

    if (documentType === "usefulWebsite") {
      likeRecord.usefulWebsiteId = {
        _type: "reference",
        _ref: documentId
      };
    } else {
      likeRecord.aiToolId = {
        _type: "reference",
        _ref: documentId
      };
    }

    await writeClient.create(likeRecord);

    // Check if auto increment is enabled
    const document = await client.fetch(
      `*[_type == "${documentTypeQuery}" && _id == $id][0]{autoIncrementLikes}`,
      { id: documentId }
    );

    // Increment likes count only if auto increment is enabled
    const shouldIncrement = document?.autoIncrementLikes !== false;
    const updatedLikes = shouldIncrement ? (likes || 0) + 1 : (likes || 0);
    
    await writeClient
      .patch(documentId)
      .set({ likes: updatedLikes })
      .commit();

    return NextResponse.json({ success: true, likes: updatedLikes });
  } catch (error) {
    console.error("Error incrementing likes:", error);
    return NextResponse.json({ error: "Failed to increment likes" }, { status: 500 });
  }
} 