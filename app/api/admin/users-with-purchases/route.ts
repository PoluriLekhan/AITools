import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

const paymentSchema = new mongoose.Schema({
  userId: String,
  plan: String,
  amount: Number,
  createdAt: Date,
});
const userSchema = new mongoose.Schema({
  uid: String,
  name: String,
  email: String,
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true } as any);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const users = await User.find({});
    const results = await Promise.all(
      users.map(async (user: any) => {
        const purchases = await Payment.find({ userId: user.uid }).sort({ createdAt: -1 });
        const currentPlan = purchases.length > 0 ? purchases[0].plan : "Free";
        return {
          id: user.uid,
          name: user.name || user.email || "-",
          email: user.email || "-",
          currentPlan,
          purchaseHistory: purchases.map((p: any) => ({
            plan: p.plan,
            amount: p.amount,
            date: p.createdAt,
          })),
        };
      })
    );
    return NextResponse.json({ success: true, users: results });
  } catch (error) {
    console.error("Failed to fetch users with purchases:", error);
    return NextResponse.json({ error: "Failed to fetch users with purchases" }, { status: 500 });
  }
} 