import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Coupon from '@/models/Coupon';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { code, orderAmount } = body;

    if (!code || !orderAmount) {
      return NextResponse.json(
        { error: 'Coupon code and order amount are required' },
        { status: 400 }
      );
    }

    // Find coupon by code
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    // Check if coupon is valid
    const now = new Date();
    const isValid = coupon.isActive && 
                   coupon.expiryDate > now && 
                   (coupon.maxUses === null || coupon.currentUses < coupon.maxUses);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Coupon has expired or reached maximum usage limit' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount of ₹${coupon.minOrderAmount} required` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, orderAmount);
    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description
      },
      calculation: {
        originalAmount: orderAmount,
        discountAmount,
        finalAmount,
        isFree: finalAmount === 0
      }
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 