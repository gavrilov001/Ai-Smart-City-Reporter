import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { analyzeImageWithHuggingFace, mapPredictionToCategoryId } from "@/lib/huggingface";

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

    // Analyze image with Hugging Face to predict the category
    let predictedCategoryId: string | null = null;
    let aiAnalysis = null;

    console.log('🎬 Starting image upload for report:', reportId);
    console.log('📸 Image name:', image.name, 'Size:', image.size, 'bytes');

    try {
      console.log('🔍 Calling analyzeImageWithHuggingFace...');
      const prediction = await analyzeImageWithHuggingFace(Buffer.from(buffer), image.name);
      console.log('📊 Prediction result:', prediction);

      if (prediction) {
        console.log('✅ Got prediction, creating aiAnalysis object');
        aiAnalysis = {
          predictedCategory: prediction.categoryName,
          confidence: prediction.confidence,
          rawLabel: prediction.rawLabel,
        };

        // Fetch available categories to map the prediction
        const { data: categories } = await supabase
          .from("categories")
          .select("id, name");

        console.log('📋 Available categories:', categories?.map((c: any) => c.name));
        console.log('🔎 Trying to match:', prediction.categoryName);

        if (categories && categories.length > 0) {
          predictedCategoryId = await mapPredictionToCategoryId(
            prediction.categoryName,
            categories
          );
          console.log('🎯 Mapped prediction to category ID:', predictedCategoryId);
        }
      } else {
        console.log('⚠️ No prediction returned from analyzeImageWithHuggingFace');
      }
    } catch (analysisError) {
      console.warn("❌ Image analysis failed, continuing without prediction:", analysisError);
      // Continue without category prediction - it's not critical
    }

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

    // Prepare image record with AI analysis
    const imageData: Record<string, unknown> = {
      report_id: reportId,
      image_url: imageUrl,
    };

    if (aiAnalysis) {
      imageData.ai_analysis = aiAnalysis;
    }

    // Insert image record into database using service role (bypasses RLS)
    const { data: imageRecord, error: dbError } = await supabase
      .from("report_images")
      .insert([imageData])
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

    // If we have a predicted category and the report doesn't have one, update it
    if (predictedCategoryId) {
      try {
        await supabase
          .from("reports")
          .update({ category_id: predictedCategoryId })
          .eq("id", reportId)
          .is("category_id", null); // Only update if category_id is null
      } catch (updateError) {
        console.warn("Failed to update report with predicted category:", updateError);
        // Don't fail the request if category update fails
      }
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Image uploaded successfully",
        data: imageRecord,
        aiPrediction: aiAnalysis || null,
        suggestedCategoryId: predictedCategoryId || null,
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
