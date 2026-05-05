import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { generateToken, hashToken } from '@/lib/token';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create user ID
    const userId = generateUUID();
    const passwordHash = hashPassword(password);

    // Generate verification token
    const { token: verificationToken, expiresAt: tokenExpiresAt } = generateToken();
    const hashedToken = hashToken(verificationToken);

    // Insert user into database with verification token
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name,
        role: role || 'citizen',
        email_verified: false,
        verification_token: hashedToken,
        verification_token_expires_at: new Date(tokenExpiresAt).toISOString(),
      })
      .select('id, name, email, role, email_verified')
      .single();

    if (insertError) {
      console.error('User insert error:', insertError);
      return NextResponse.json(
        { message: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    console.log(`User ${email} registered successfully. Verification email sent.`);

    return NextResponse.json(
      {
        message: 'Registration successful! Please check your email to verify your account.',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    const errorMsg = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json(
      { message: errorMsg },
      { status: 500 }
    );
  }
}
