import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "debug",
    message: "Check your Supabase console for the following:",
    steps: [
      "1. Go to Supabase Dashboard → Authentication → Policies",
      "2. Look at 'users' table Row Level Security (RLS) settings",
      "3. If RLS is enabled, check the policies for INSERT permission",
      "4. The policy should allow service role to insert: 'service_role' in auth.jwt_role()",
      "5. Or disable RLS on the users table temporarily for testing",
      "6. Alternative: Go to Table Editor → users → RLS settings and disable RLS",
    ],
    solution: "You need to either: A) Disable RLS on users table, or B) Add policy allowing service role inserts",
  });
}
