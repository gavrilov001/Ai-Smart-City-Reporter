import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { hashToken, isTokenExpired } from '@/lib/token';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      );
    }

    const hashedToken = hashToken(token);

    // Find user with this verification token
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, email_verified, verification_token_expires_at')
      .eq('verification_token', hashedToken)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (user.verification_token_expires_at && isTokenExpired(new Date(user.verification_token_expires_at).getTime())) {
      return NextResponse.json(
        { message: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Update user to mark email as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error verifying email:', updateError);
      return NextResponse.json(
        { message: 'Failed to verify email' },
        { status: 500 }
      );
    }

    console.log(`Email verified for user: ${user.email}`);

    return NextResponse.json(
      { message: 'Email verified successfully! You can now log in.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Verification error:', err);
    const errorMsg = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json(
      { message: errorMsg },
      { status: 500 }
    );
  }
}
