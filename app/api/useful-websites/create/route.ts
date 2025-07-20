import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_GITHUB_ID_QUERY } from "@/sanity/lib/queries";

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, websiteURL, websiteImage, pitch, authorId: firebaseUid } = await request.json();
    
    if (!title || !description || !category || !websiteURL || !firebaseUid) {
      return NextResponse.json({ 
        error: "Missing required fields: title, description, category, websiteURL, and authorId are required" 
      }, { status: 400 });
    }

    // First, ensure the user exists in Sanity (same logic as createAiTool)
    const existingUser = await client
      .withConfig({ useCdn: false })
      .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id: firebaseUid });
    
    let sanityAuthorId = existingUser?._id;
    
    // If user doesn't exist, we need to create them first
    if (!existingUser) {
      return NextResponse.json({ 
        error: "User profile not found. Please try logging out and logging back in, or contact support." 
      }, { status: 400 });
    }

    // Check for duplicate website URL
    const existingWebsite = await client.fetch(
      `*[_type == "usefulWebsite" && websiteURL == $websiteURL][0]`,
      { websiteURL }
    );

    if (existingWebsite) {
      return NextResponse.json({ 
        error: "A website with this URL already exists" 
      }, { status: 400 });
    }

    // Create the useful website document
    const usefulWebsiteDoc = {
      _type: "usefulWebsite",
      title,
      description,
      category,
      websiteURL,
      websiteImage: websiteImage || "/logo.png",
      pitch: pitch || "",
      status: "pending",
      views: 0,
      autoIncrementViews: true,
      author: {
        _type: "reference",
        _ref: sanityAuthorId,
      },
    };

    const result = await writeClient.create(usefulWebsiteDoc);

    return NextResponse.json({ 
      success: true, 
      _id: result._id,
      message: "Useful website created successfully and is pending admin approval"
    });

  } catch (error) {
    let errorMessage = "Failed to create useful website";
    if (error && typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string") {
      errorMessage = (error as any).message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = JSON.stringify(error);
    }
    console.error("Error creating useful website:", error);
    return NextResponse.json({ 
      error: errorMessage || "Unknown error occurred while creating useful website" 
    }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function PUT() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function PATCH() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
} 