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

    // Parse request body - handle both JSON and FormData
    const contentType = request.headers.get("content-type");
    let title, description, category_id, latitude, longitude, address, user_id;

    if (contentType?.includes("application/json")) {
      const body = await request.json();
      title = body.title;
      description = body.description;
      category_id = body.category_id;
      latitude = body.latitude;
      longitude = body.longitude;
      address = body.address;
      user_id = body.user_id;
    } else if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = formData.get("title");
      description = formData.get("description");
      category_id = formData.get("category_id");
      latitude = formData.get("latitude");
      longitude = formData.get("longitude");
      address = formData.get("address");
      user_id = formData.get("user_id");
    } else {
      const body = await request.json();
      title = body.title;
      description = body.description;
      category_id = body.category_id;
      latitude = body.latitude;
      longitude = body.longitude;
      address = body.address;
      user_id = body.user_id;
    }

    // Validate required fields
    if (!title || !description || !category_id || !user_id) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required fields: title, description, category_id, user_id",
        },
        { status: 400 }
      );
    }

    // Convert latitude/longitude to numbers if provided
    const lat = latitude ? parseFloat(latitude as string) : null;
    const lng = longitude ? parseFloat(longitude as string) : null;

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

    // Insert report into Supabase
    const { data: report, error } = await supabase
      .from("reports")
      .insert([
        {
          title,
          description,
          category_id,
          latitude: lat,
          longitude: lng,
          address: address || null,
          user_id,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to create report",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Report created successfully",
        data: report,
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
