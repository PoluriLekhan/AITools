import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 }
      );
    }

    // Find notifications that are older than 24 hours from when the user saw them
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const notificationsToCleanup = await client.fetch(`
      *[_type == "notification" && isActive == true] {
        _id,
        userStatuses[userEmail == $userEmail && seen == true && seenAt < $twentyFourHoursAgo] {
          userId,
          userEmail,
          seen,
          seenAt
        }
      }[count(userStatuses) > 0]
    `, { userEmail, twentyFourHoursAgo: twentyFourHoursAgo.toISOString() });

    let deletedCount = 0;

    // Delete notifications that are expired for this user
    for (const notification of notificationsToCleanup) {
      try {
        await writeClient.delete(notification._id);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting notification ${notification._id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired notifications for user`,
      deletedCount
    });
  } catch (error) {
    console.error("Error cleaning up user notifications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 