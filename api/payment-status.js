import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../app/api/auth/[...nextauth]";

const paymentSchema = new mongoose.Schema({
  orderId: String,
  paymentId: String,
  signature: String,
  status: String,
  user: Object,
  plan: String,
  createdAt: { type: Date, default: Date.now },
});
const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  // NextAuth session and admin check
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.isAdmin) {
    return res.status(401).json({ error: "Unauthorized: Admins only" });
  }
  try {
    await connectDB();
    const payments = await Payment.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ payments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch payments" });
  }
} 