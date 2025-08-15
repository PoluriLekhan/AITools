import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');

    // Verify admin access
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID required' },
        { status: 400 }
      );
    }

    const admin = await User.findById(adminId);
    if (!admin || (admin as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all users with their orders
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    const usersWithOrders = await Promise.all(
      users.map(async (user: any) => {
        const orders = await Order.find({ user: user._id })
          .populate('plan', 'name price duration')
          .populate('coupon', 'code discountType discountValue')
          .sort({ createdAt: -1 })
          .select('-__v');

        return {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          orders: orders.map((order: any) => ({
            id: order._id,
            planName: order.plan?.name,
            planPrice: order.plan?.price,
            planDuration: order.plan?.duration,
            originalAmount: order.originalAmount,
            discountAmount: order.discountAmount,
            finalAmount: order.finalAmount,
            couponCode: order.couponCode,
            couponDiscountType: order.coupon?.discountType,
            couponDiscountValue: order.coupon?.discountValue,
            status: order.status,
            paymentMethod: order.paymentMethod,
            orderDate: order.createdAt,
            planActivationDate: order.planActivationDate,
            planExpiryDate: order.planExpiryDate
          })),
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum: number, order: any) => sum + order.finalAmount, 0),
          activePlans: orders.filter((order: any) => 
            order.status === 'success' && 
            (!order.planExpiryDate || order.planExpiryDate > new Date())
          ).length
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithOrders,
      totalUsers: usersWithOrders.length,
      totalOrders: usersWithOrders.reduce((sum: number, user: any) => sum + user.totalOrders, 0),
      totalRevenue: usersWithOrders.reduce((sum: number, user: any) => sum + user.totalSpent, 0)
    });

  } catch (error) {
    console.error('Error fetching users with orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 