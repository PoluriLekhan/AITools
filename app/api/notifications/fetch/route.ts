import { NextRequest, NextResponse } from "next/server";
import { fetchUserNotifications, fetchUnseenNotificationsCount } from "@/lib/sanity-client";

// Email validation regex (simple version)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Type for userStatuses
interface UserStatus {
  userId?: string;
  userEmail?: string;
  seen?: boolean;
  seenAt?: string;
  deleted?: boolean;
  deletedAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received body in /api/notifications/fetch:", body);
    const { userEmail, type } = body;

    // Validation
    if (!userEmail || typeof userEmail !== "string" || !EMAIL_REGEX.test(userEmail.trim())) {
      return NextResponse.json(
        { error: "Invalid or missing userEmail. Must be a valid email address." },
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
    if (type !== "count" && type !== "all") {
      return NextResponse.json(
        { error: "Invalid or missing type. Must be either 'count' or 'all'." },
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    let result;
    if (type === "count") {
      result = await fetchUnseenNotificationsCount(userEmail);
      if (!result.success) {
        console.error("Error from fetchUnseenNotificationsCount:", result.error);
        return NextResponse.json(
          { error: result.error || "Failed to fetch notification count." },
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      return NextResponse.json(
        { count: typeof result.data === "number" ? result.data : 0 },
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      // type === "all"
      result = await fetchUserNotifications(userEmail);
      if (!result.success) {
        console.error("Error from fetchUserNotifications:", result.error);
        return NextResponse.json(
          { error: result.error || "Failed to fetch notifications." },
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      // Filter notifications for this userEmail
      const notifications = Array.isArray(result.data)
        ? result.data.filter((n) =>
            Array.isArray(n.userStatuses) &&
            (n.userStatuses as UserStatus[]).some((u: UserStatus) => u.userEmail === userEmail)
          )
        : [];
      return NextResponse.json(
        { notifications },
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in notifications fetch API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 