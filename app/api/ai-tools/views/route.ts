import { NextRequest, NextResponse } from "next/server";
import { fetchAIToolViews } from "@/lib/sanity-client";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "AI tool ID is required" },
        { status: 400 }
      );
    }

    const result = await fetchAIToolViews(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in AI tool views API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 

export function GET() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function PUT() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function DELETE() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function PATCH() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
} 