import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('report_comments')
      .select(`
        *,
        admin:users (
          id,
          name,
          email
        )
      `)
      .eq('report_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { status: 'error', message: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: data,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { comment, admin_id } = body;

    if (!comment || !admin_id) {
      return NextResponse.json(
        { status: 'error', message: 'Comment and admin_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('report_comments')
      .insert([
        {
          report_id: id,
          admin_id: admin_id,
          comment: comment,
          created_at: new Date().toISOString(),
        },
      ])
      .select(`
        *,
        admin:users (
          id,
          name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { status: 'error', message: 'Failed to save comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: data,
    });
  } catch (error) {
    console.error('Error saving comment:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
