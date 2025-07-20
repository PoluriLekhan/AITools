import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body;
    if (!amount || typeof amount !== "number") {
      console.error("Amount is required and must be a number", { amount });
      return NextResponse.json({ error: "Amount is required and must be a number" }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      console.error("Razorpay keys not set in environment");
      return NextResponse.json({ error: "Razorpay keys not set in environment" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });
    console.log("Razorpay order created", order);
    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Error in /api/create-order:", error);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
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