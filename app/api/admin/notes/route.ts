import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { reportId, adminId, noteText, imageUrl } = await request.json();

    if (!reportId || !adminId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required fields: reportId and adminId",
        },
        { status: 400 }
      );
    }

    if (!noteText && !imageUrl) {
      return NextResponse.json(
        {
          status: "error",
          message: "Note must contain either text or an image",
        },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("admin_notes")
      .insert([
        {
          report_id: reportId,
          admin_id: adminId,
          note_text: noteText || null,
          image_url: imageUrl || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to save note",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Note saved successfully",
        data: data,
      },
      { status: 201 }
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required parameter: reportId",
        },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("admin_notes")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to fetch notes",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: data || [],
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
