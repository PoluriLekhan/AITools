import Razorpay from "razorpay";

function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error("[API ERROR]", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error", details: err?.message || err });
      }
    }
  };
}

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return res.status(500).json({ error: "Razorpay keys not set in environment" });
  }

  // Log the request body for debugging
  console.log("[create-order] req.body:", req.body);

  // Validate input
  const { amount, currency } = req.body || {};
  if (amount === undefined || currency === undefined) {
    return res.status(400).json({ error: "Missing required fields: amount and currency are required." });
  }
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number." });
  }
  if (typeof currency !== 'string' || !currency.trim()) {
    return res.status(400).json({ error: "Currency must be a non-empty string." });
  }

  const razorpay = new Razorpay({ key_id, key_secret });
  // Razorpay expects amount in the smallest currency unit (e.g., paise for INR)
  const order = await razorpay.orders.create({
    amount: amount * 100, // Convert to paise
    currency,
    receipt: "rcpt_" + Date.now(),
  });
  return res.status(200).json({ orderId: order.id });
}

export default withErrorHandler(handler); 