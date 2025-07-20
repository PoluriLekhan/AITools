import { NextRequest, NextResponse } from "next/server";
import { fetchUserNotifications, fetchUnseenNotificationsCount } from "@/lib/sanity-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received body in /api/notifications/fetch:", body);
    console.log("Received headers in /api/notifications/fetch:", Object.fromEntries(request.headers.entries()));
    const { userEmail, type } = body;
    
    if (!userEmail || typeof userEmail !== 'string' || userEmail.trim() === '') {
      // Return default response instead of error
      if (type === 'count') {
        return NextResponse.json(0);
      } else {
        return NextResponse.json([]);
      }
    }
    if (!type || (type !== 'count' && type !== 'all')) {
      // Return default response for invalid type
      return NextResponse.json([]);
    }

    let result;
    
    if (type === "count") {
      result = await fetchUnseenNotificationsCount(userEmail);
    } else {
      result = await fetchUserNotifications(userEmail);
    }
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in notifications fetch API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 