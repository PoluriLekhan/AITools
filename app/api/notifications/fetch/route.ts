import { NextRequest, NextResponse } from "next/server";
import { fetchUserNotifications, fetchUnseenNotificationsCount } from "@/lib/sanity-client";

export async function POST(request: NextRequest) {
  try {
    const { userEmail, type } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
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