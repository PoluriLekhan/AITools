import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// MongoDB Payment schema
const paymentSchema = new mongoose.Schema({
  orderId: String,
  paymentId: String,
  signature: String,
  status: String,
  user: Object,
  plan: String, // Added plan field
  amount: Number, // Added amount field
  createdAt: { type: Date, default: Date.now },
});
const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user, plan, amount } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
    return res.status(400).json({ error: "Missing payment details or plan" });
  }

  try {
    await connectDB();
    // Verify signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    let status = "failure";
    if (generated_signature === razorpay_signature) {
      status = "success";
    }
    // Store payment info
    await Payment.create({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status,
      user,
      plan,
      amount, // Save amount
    });
    // If payment is successful, update user's plan in author collection
    if (status === "success" && user && user.email) {
      // Update plan in Sanity author document
      await fetch(`${process.env.SANITY_API_URL}/authors/update-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, plan }),
      });
    }
    // Send real-time update
    const { broadcastPaymentStatus } = require('./websocket.js');
    broadcastPaymentStatus({ orderId: razorpay_order_id, status, user });
    return res.status(200).json({ status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Payment verification failed" });
  }
} 