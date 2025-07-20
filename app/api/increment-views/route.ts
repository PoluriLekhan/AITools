import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
  try {
    const { documentId, documentType = "aiTool", views } = await request.json();
    
    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const documentTypeQuery = documentType === "usefulWebsite" ? "usefulWebsite" : "aiTool";

    // Check if auto increment is enabled
    const document = await client.fetch(
      `*[_type == "${documentTypeQuery}" && _id == $id][0]{autoIncrementViews}`,
      { id: documentId }
    );

    // Increment views only if auto increment is enabled
    const shouldIncrement = document?.autoIncrementViews !== false;
    const updatedViews = shouldIncrement ? (views || 0) + 1 : (views || 0);
    
    await writeClient
      .patch(documentId)
      .set({ views: updatedViews })
      .commit();

    return NextResponse.json({ success: true, views: updatedViews });
  } catch (error) {
    console.error("Error incrementing views:", error);
    return NextResponse.json({ error: "Failed to increment views" }, { status: 500 });
  }
} 