import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/actions";
import { client } from "@/sanity/lib/client";
import { ALL_AUTHORS_QUERY } from "@/sanity/lib/queries";

export async function POST(request: NextRequest) {
  try {
    const { title, content, type, sentByUserId } = await request.json();
    
    if (!title || !content || !type || !sentByUserId) {
      return NextResponse.json(
        { success: false, error: "Title, content, type, and sentByUserId are required" },
        { status: 400 }
      );
    }

    // Get all users to send notification to
    const allUsers = await client.fetch(ALL_AUTHORS_QUERY);
    
    const result = await createNotification(title, content, type, sentByUserId, allUsers);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 