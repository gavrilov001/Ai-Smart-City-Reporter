import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { role, name, email } = await request.json();

    // Build update object
    const updateData: any = {};

    // If role is provided, validate and add it
    if (role) {
      if (!['administrator', 'citizen'].includes(role)) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Invalid role',
          },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    // If name is provided, validate and add it
    if (name) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Name is required and must be a string',
          },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    // If email is provided, validate and add it
    if (email) {
      if (typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Valid email is required',
          },
          { status: 400 }
        );
      }
      updateData.email = email.trim();
    }

    // Check if at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'At least one field must be provided for update',
        },
        { status: 400 }
      );
    }

    // Update user
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to update user',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'User updated successfully',
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to delete user',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'User deleted successfully',
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
