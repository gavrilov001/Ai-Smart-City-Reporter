import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const reportId = formData.get("report_id") as string;

    if (!image) {
      return NextResponse.json(
        {
          status: "error",
          message: "No image provided",
        },
        { status: 400 }
      );
    }

    if (!reportId) {
      return NextResponse.json(
        {
          status: "error",
          message: "No report_id provided",
        },
        { status: 400 }
      );
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Convert file to buffer
    const buffer = await image.arrayBuffer();
    const filename = `${reportId}-${Date.now()}-${image.name}`;
    const filepath = `reports/${filename}`;

    // Upload to Supabase storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("report-images")
      .upload(filepath, buffer, {
        contentType: image.type,
      });

    if (storageError) {
      console.error("Storage error:", storageError);
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to upload image to storage",
          error: storageError.message,
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("report-images")
      .getPublicUrl(filepath);

    const imageUrl = urlData?.publicUrl;

    // Insert image record into database using service role (bypasses RLS)
    const { data: imageRecord, error: dbError } = await supabase
      .from("report_images")
      .insert([
        {
          report_id: reportId,
          image_url: imageUrl,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to save image record",
          error: dbError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Image uploaded successfully",
        data: imageRecord,
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
