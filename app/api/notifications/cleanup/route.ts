import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredNotifications } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    const result = await cleanupExpiredNotifications();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${result.deletedCount} expired notifications`,
        deletedCount: result.deletedCount
      });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error cleaning up expired notifications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 