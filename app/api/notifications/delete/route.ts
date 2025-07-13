import { NextRequest, NextResponse } from "next/server";
import { deleteNotification } from "@/lib/actions";

export async function DELETE(request: NextRequest) {
  try {
    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteNotification(notificationId);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 