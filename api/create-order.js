import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return res.status(500).json({ error: "Razorpay keys not set in environment" });
  }

  const { amount } = req.body;
  if (!amount || typeof amount !== "number") {
    return res.status(400).json({ error: "Amount is required and must be a number" });
  }

  try {
    const razorpay = new Razorpay({ key_id, key_secret });
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });
    return res.status(200).json({ orderId: order.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Order creation failed" });
  }
} 