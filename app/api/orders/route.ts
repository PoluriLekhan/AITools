import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Order from '@/models/Order';
import User from '@/models/User';
import Plan from '@/models/Plan';
import Coupon from '@/models/Coupon';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      userId,
      planId,
      originalAmount,
      discountAmount = 0,
      finalAmount,
      couponCode,
      paymentMethod = 'razorpay',
      paymentId,
      orderId,
      transactionId,
      paymentDetails
    } = body;

    // Validate required fields
    if (!userId || !planId || !originalAmount || finalAmount === undefined) {
      return NextResponse.json(
        { error: 'User ID, plan ID, original amount, and final amount are required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Find coupon if provided
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        // Increment coupon usage
        coupon.currentUses += 1;
        await coupon.save();
      }
    }

    // Calculate plan expiry date
    const planActivationDate = new Date();
    let planExpiryDate = null;
    
    if (plan.duration === 'month') {
      planExpiryDate = new Date(planActivationDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (plan.duration === 'year') {
      planExpiryDate = new Date(planActivationDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    } else if (plan.duration === 'lifetime') {
      planExpiryDate = null; // Lifetime plans don't expire
    }

    // Create order
    const order = new Order({
      user: userId,
      plan: planId,
      originalAmount,
      discountAmount,
      finalAmount,
      coupon: coupon?._id,
      couponCode,
      paymentMethod,
      paymentId,
      orderId,
      transactionId,
      paymentDetails,
      planActivationDate,
      planExpiryDate,
      status: finalAmount === 0 ? 'success' : 'pending'
    });

    await order.save();

    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderId: order.orderId,
        planName: plan.name,
        originalAmount: order.originalAmount,
        discountAmount: order.discountAmount,
        finalAmount: order.finalAmount,
        couponUsed: order.couponCode,
        status: order.status,
        orderDate: order.createdAt,
        planActivationDate: order.planActivationDate,
        planExpiryDate: order.planExpiryDate
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');

    const query: any = {};
    if (userId) query.user = userId;
    if (status) query.status = status;
    if (orderId) query._id = orderId;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('plan', 'name price duration')
      .populate('coupon', 'code discountType discountValue')
      .sort({ createdAt: -1 })
      .select('-__v');

    return NextResponse.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 