import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const { report_id, status, admin_id } = body;

    // Validate required fields
    if (!report_id || !status || !admin_id) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required fields: report_id, status, admin_id",
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

    // Step 1: Get the current report to retrieve user_id and old status
    const { data: currentReport, error: reportError } = await supabase
      .from("reports")
      .select("id, user_id, status")
      .eq("id", report_id)
      .single();

    if (reportError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Report not found",
          error: reportError.message,
        },
        { status: 404 }
      );
    }

    const oldStatus = currentReport.status;
    const userId = currentReport.user_id;

    // Step 2: Update report status
    const { data: updatedReport, error: updateError } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", report_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to update report status",
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    // Step 3: Insert record in report_history
    const { error: historyError } = await supabase
      .from("report_history")
      .insert([
        {
          report_id,
          old_status: oldStatus,
          new_status: status,
          changed_by: admin_id,
        },
      ]);

    if (historyError) {
      // Log the error but don't fail the entire request
      console.error("Failed to insert report history:", historyError);
    }

    // Step 4: Create notification for user
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: userId,
          message: `Your report status has been updated to: ${status}`,
          is_read: false,
        },
      ]);

    if (notificationError) {
      // Log the error but don't fail the entire request
      console.error("Failed to create notification:", notificationError);
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Report status updated successfully",
        data: {
          report: updatedReport,
          oldStatus,
          newStatus: status,
        },
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
