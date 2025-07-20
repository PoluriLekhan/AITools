import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_GITHUB_ID_QUERY } from "@/sanity/lib/queries";

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, websiteURL, websiteImage, pitch, authorId: firebaseUid, amount } = await request.json();
    
    console.log('Received amount:', amount);
    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({
        error: "Amount is required and must be a positive number"
      }, { status: 400 });
    }

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
      // We need user details to create the author
      // For now, return an error asking for more user info
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
      amount: Number(amount),
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
    console.error("Error creating useful website:", error);
    return NextResponse.json({ 
      error: "Failed to create useful website" 
    }, { status: 500 });
  }
} 