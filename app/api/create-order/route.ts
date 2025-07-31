import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: NextRequest) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      console.error("Razorpay keys not set in environment");
      return NextResponse.json({ error: "Razorpay keys not set in environment" }, { status: 500 });
    }

    // Parse amount and currency from request body, fallback to defaults
    let amount = 100; // default amount in INR
    let currency = "INR";
    try {
      const body = await request.json();
      if (body.amount && typeof body.amount === "number") amount = body.amount;
      if (body.currency && typeof body.currency === "string") currency = body.currency;
    } catch (e) {
      // If parsing fails, use defaults
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency,
      receipt: "rcpt_" + Date.now(),
    });
    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Error in /api/create-order:", error);
    // Return a more detailed error message for debugging (do not leak sensitive info)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Order creation failed" }, { status: 500 });
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