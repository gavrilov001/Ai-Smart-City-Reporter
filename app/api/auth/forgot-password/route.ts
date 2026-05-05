import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';
import { generatePasswordResetToken, hashToken } from '@/lib/token';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', email)
      .single();

    // For security, always return the same message to prevent email enumeration
    if (fetchError || !user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate password reset token
    const { token: resetToken, expiresAt: tokenExpiresAt } = generatePasswordResetToken();
    const hashedToken = hashToken(resetToken);

    // Update user with reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_reset_token: hashedToken,
        password_reset_token_expires_at: new Date(tokenExpiresAt).toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error generating reset token:', updateError);
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken, user.name);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    console.log(`Password reset email sent for user: ${email}`);

    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link has been sent.' },
      { status: 200 }
    );
  }
}
