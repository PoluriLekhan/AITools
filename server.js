const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: "rzp_test_586xawLEGMVoPW",
  key_secret: "FbXBUO71vGwsSdk5eH1kIY8h",
});

app.post("/api/create-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });
    res.json({ orderId: order.id });
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

app.listen(4000, () => console.log("Server running on port 4000")); 