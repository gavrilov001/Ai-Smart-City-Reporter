import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { hashToken, isTokenExpired } from '@/lib/token';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const hashedToken = hashToken(token);

    // Find user with this reset token
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, password_reset_token_expires_at')
      .eq('password_reset_token', hashedToken)
      .single();

    console.log('Reset password request:', { token: token.substring(0, 10) + '...', hashedToken: hashedToken.substring(0, 10) + '...', userFound: !!user, fetchError });

    if (fetchError || !user) {
      console.error('User not found with reset token:', fetchError);
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (user.password_reset_token_expires_at) {
      const expiresAt = new Date(user.password_reset_token_expires_at).getTime();
      const now = Date.now();
      console.log('Token expiry check:', { expiresAt, now, isExpired: now > expiresAt });
      
      if (isTokenExpired(expiresAt)) {
        return NextResponse.json(
          { message: 'Reset token has expired' },
          { status: 400 }
        );
      }
    }

    // Update user password
    const hashedPassword = hashPassword(password);
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        password_reset_token: null,
        password_reset_token_expires_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error resetting password:', updateError);
      return NextResponse.json(
        { message: 'Failed to reset password' },
        { status: 500 }
      );
    }

    console.log(`Password reset successfully for user: ${user.email}`);

    return NextResponse.json(
      { message: 'Password reset successfully! You can now log in with your new password.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Reset password error:', err);
    const errorMsg = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json(
      { message: errorMsg },
      { status: 500 }
    );
  }
}
