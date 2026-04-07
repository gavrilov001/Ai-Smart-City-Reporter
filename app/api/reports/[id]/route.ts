import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing environment variables",
        },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
    const reportId = resolvedParams.id;

    if (!reportId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Report ID is required",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignored
          }
        },
      },
    });

    // Fetch report with related data
    const { data: report, error } = await supabase
      .from("reports")
      .select(
        `
        *,
        categories:category_id(id, name, description),
        users:user_id(id, name, email, role),
        report_images(id, image_url, uploaded_at),
        report_comments(id, comment, admin_id, created_at, users:admin_id(id, name, email))
        `
      )
      .eq("id", reportId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            status: "error",
            message: "Report not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          status: "error",
          message: "Failed to fetch report",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: report,
      },
      { status: 200 }
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";

    return NextResponse.json(
      {
        status: "error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
