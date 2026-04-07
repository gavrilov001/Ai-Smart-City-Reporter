import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error('User not found:', email);
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // TODO: In production, implement proper password hashing (bcrypt, argon2, etc)
    // For now, we'll use a simple hash. You should store hashed passwords in DB.
    const passwordHash = hashPassword(password);
    
    // If you want to verify password against stored hash:
    // const { data: authData } = await supabase
    //   .from('users')
    //   .select('password_hash')
    //   .eq('id', user.id)
    //   .single();
    // if (!authData || authData.password_hash !== passwordHash) { ... }

    // For MVP: accept any password (remove in production!)
    console.log(`User ${email} logged in successfully`);

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'citizen',
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
