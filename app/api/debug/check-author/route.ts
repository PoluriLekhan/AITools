import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { AUTHOR_BY_EMAIL_QUERY } from '@/sanity/lib/queries';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const author = await client.fetch(AUTHOR_BY_EMAIL_QUERY, { email });
    
    return NextResponse.json({
      exists: !!author,
      isAdmin: author?.isAdmin || false,
      role: author?.role || null,
      author: author || null
    });
  } catch (error) {
    console.error('Error checking author:', error);
    return NextResponse.json({ error: 'Failed to check author' }, { status: 500 });
  }
} 