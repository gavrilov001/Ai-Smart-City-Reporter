import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { role } = await request.json();
    const userId = params.id;

    if (!role || !['administrator', 'citizen'].includes(role)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid role',
        },
        { status: 400 }
      );
    }

    // Update user role
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select();

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to update user role',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'User role updated successfully',
        data: data?.[0],
      },
      { status: 200 }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';

    return NextResponse.json(
      {
        status: 'error',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
