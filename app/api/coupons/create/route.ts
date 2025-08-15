import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Coupon from '@/models/Coupon';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      expiryDate,
      maxUses,
      minOrderAmount,
      maxDiscountAmount,
      description,
      createdBy
    } = body;

    // Validate required fields
    if (!code || !discountType || !discountValue || !expiryDate || !createdBy) {
      return NextResponse.json(
        { error: 'Code, discount type, discount value, expiry date, and creator are required' },
        { status: 400 }
      );
    }

    // Validate discount type
    if (!['percentage', 'fixed'].includes(discountType)) {
      return NextResponse.json(
        { error: 'Discount type must be either "percentage" or "fixed"' },
        { status: 400 }
      );
    }

    // Validate discount value
    if (discountValue <= 0) {
      return NextResponse.json(
        { error: 'Discount value must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate percentage discount
    if (discountType === 'percentage' && discountValue > 100) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      );
    }

    // Check if creator is admin
    const creator = await User.findById(createdBy);
    if (!creator || creator.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create coupons' },
        { status: 403 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 409 }
      );
    }

    // Create new coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiryDate: new Date(expiryDate),
      maxUses: maxUses || null,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      description,
      createdBy
    });

    await coupon.save();

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expiryDate: coupon.expiryDate,
        maxUses: coupon.maxUses,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        description: coupon.description,
        isActive: coupon.isActive,
        currentUses: coupon.currentUses,
        createdAt: coupon.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
    const coupons = await Coupon.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .select('-__v');

    return NextResponse.json({
      success: true,
      coupons
    });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 