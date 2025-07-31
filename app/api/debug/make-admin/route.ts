import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/write-client';
import { client } from '@/sanity/lib/client';
import { AUTHOR_BY_EMAIL_QUERY } from '@/sanity/lib/queries';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // First, find the author
    const author = await client.fetch(AUTHOR_BY_EMAIL_QUERY, { email });
    
    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    // Update the author to make them admin
    const result = await writeClient
      .patch(author._id)
      .set({ isAdmin: true, role: 'super-admin' })
      .commit();
    
    return NextResponse.json({
      success: true,
      authorId: result._id,
      message: 'Author made admin successfully'
    });
  } catch (error) {
    console.error('Error making author admin:', error);
    return NextResponse.json({ error: 'Failed to make author admin' }, { status: 500 });
  }
} 