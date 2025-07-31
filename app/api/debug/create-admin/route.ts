import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/write-client';

export async function POST(request: NextRequest) {
  try {
    const { email, name, isAdmin, role } = await request.json();
    
    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    const authorDoc = {
      _type: 'author',
      name,
      email,
      isAdmin: isAdmin || false,
      role: role || 'user',
      plan: 'free'
    };

    const result = await writeClient.create(authorDoc);
    
    return NextResponse.json({
      success: true,
      authorId: result._id,
      message: 'Admin author created successfully'
    });
  } catch (error) {
    console.error('Error creating admin author:', error);
    return NextResponse.json({ error: 'Failed to create admin author' }, { status: 500 });
  }
} 