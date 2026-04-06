import { createServerClient } from "@supabase/ssr";
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Debug: Log environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing environment variables',
        debug: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          url: supabaseUrl ? '✓ loaded' : '✗ missing',
          key: supabaseKey ? '✓ loaded' : '✗ missing',
        }
      }, { status: 500 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // ignored
          }
        },
      },
    })

    // Test the connection by fetching auth status
    const { data: { session } } = await supabase.auth.getSession()

    return NextResponse.json({
      status: 'connected',
      message: 'Supabase connection successful!',
      sessionActive: !!session,
      config: {
        url: supabaseUrl,
        hasAnonKey: !!supabaseKey,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Supabase connection failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
