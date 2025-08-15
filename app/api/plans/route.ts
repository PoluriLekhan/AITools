import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Plan from '@/models/Plan';

export async function GET() {
  try {
    await connectDB();
    
    const plans = await Plan.find({ isActive: true })
      .sort({ sortOrder: 1, price: 1 })
      .select('-__v');

    return NextResponse.json({
      success: true,
      plans
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, price, description, features, duration, currency, isPopular, sortOrder } = body;

    // Validate required fields
    if (!name || !price || !description || !features) {
      return NextResponse.json(
        { error: 'Name, price, description, and features are required' },
        { status: 400 }
      );
    }

    // Create new plan
    const plan = new Plan({
      name,
      price,
      description,
      features,
      duration: duration || 'month',
      currency: currency || 'INR',
      isPopular: isPopular || false,
      sortOrder: sortOrder || 0
    });

    await plan.save();

    return NextResponse.json({
      success: true,
      plan
    });

  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 