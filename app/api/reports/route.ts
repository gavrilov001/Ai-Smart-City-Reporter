import { createSupabaseClient } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseClient();

    // Fetch reports with related data from categories and users
    const { data: reports, error } = await supabase
      .from("reports")
      .select(
        `
        *,
        categories:category_id(id, name, description),
        users:user_id(id, name, email, role),
        report_images(id, image_url, uploaded_at)
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to fetch reports",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: reports,
        count: reports?.length || 0,
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
