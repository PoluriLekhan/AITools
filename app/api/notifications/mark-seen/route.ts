import { NextRequest, NextResponse } from "next/server";
import { markNotificationAsSeen } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    const { notificationId, userEmail } = await request.json();
    
    if (!notificationId || !userEmail) {
      return NextResponse.json(
        { success: false, error: "Notification ID and user email are required" },
        { status: 400 }
      );
    }

    const result = await markNotificationAsSeen(notificationId, userEmail);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error marking notification as seen:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 