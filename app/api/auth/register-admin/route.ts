import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, userType } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required fields: email, password, name",
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          status: "error",
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "Server configuration error: Missing Supabase credentials",
        },
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("Attempting to sign up user:", email);

    // Sign up user - this should work without needing to insert into users table
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: userType || "citizen",
        },
      },
    });

    if (signUpError) {
      console.error("Sign up error details:", {
        message: signUpError.message,
        status: signUpError.status,
        code: signUpError.code,
        name: signUpError.name,
      });
      return NextResponse.json(
        {
          status: "error",
          message: signUpError.message || "Failed to create account",
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.error("No user returned from signUp");
      return NextResponse.json(
        {
          status: "error",
          message: "User creation failed - no user data returned",
        },
        { status: 400 }
      );
    }

    console.log("User created successfully:", authData.user.id);

    // Optionally try to insert into users table (non-critical)
    try {
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseServiceKey) {
        console.log("Attempting to create user profile...");
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        const { error: insertError } = await supabaseAdmin
          .from("users")
          .insert([
            {
              id: authData.user.id,
              email,
              name,
              role: userType || "citizen",
            },
          ]);

        if (insertError) {
          console.warn("Profile insert error (non-fatal):", insertError.message);
        } else {
          console.log("User profile created successfully");
        }
      }
    } catch (profileErr) {
      console.warn("Profile creation exception (non-fatal):", profileErr);
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Registration successful! You can now log in.",
        data: {
          userId: authData.user.id,
          email: authData.user.email,
          name,
          role: userType || "citizen",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json(
      {
        status: "error",
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}
