import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { imageBase64, imageUrl, categories } = await request.json();

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        {
          status: "error",
          message: "Image data or URL required",
        },
        { status: 400 }
      );
    }

    const imaggaApiKey = process.env.IMAGGA_API_KEY;
    const imaggaApiSecret = process.env.IMAGGA_API_SECRET;

    if (!imaggaApiKey || !imaggaApiSecret) {
      console.warn("Imagga API credentials not configured");
      return NextResponse.json(
        {
          status: "success",
          message: "Image analysis not available",
          suggested_category: null,
          confidence: 0,
        },
        { status: 200 }
      );
    }

    // Prepare request body for Imagga
    let requestBody: any;
    let headers: any = {};

    // Create Basic Auth header for Imagga
    const authString = Buffer.from(`${imaggaApiKey}:${imaggaApiSecret}`).toString("base64");
    headers["Authorization"] = `Basic ${authString}`;

    if (imageBase64) {
      // For base64 images, send as FormData with base64
      const formData = new FormData();
      formData.append("image_base64", imageBase64);
      requestBody = formData;
    } else {
      // For URLs, send as FormData with URL
      const formData = new FormData();
      formData.append("image_url", imageUrl);
      requestBody = formData;
    }

    console.log("Attempting Imagga image tagging...");

    try {
      const response = await fetch(
        "https://api.imagga.com/v2/tags",
        {
          headers,
          method: "POST",
          body: requestBody,
        }
      );

      console.log("Imagga API response status:", response.status);

      if (response.ok) {
        const taggingResult = await response.json() as any;
        console.log("Imagga tagging result:", taggingResult);

        // Extract tags from Imagga response
        const tags = taggingResult.result?.tags || [];
        console.log("Extracted tags:", tags);

        if (tags.length > 0) {
          // Classify based on tags
          const classification = classifyByTags(tags, categories);
          return NextResponse.json(classification, { status: 200 });
        }
      } else {
        const errorText = await response.text();
        console.warn("Imagga API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
      }
    } catch (err) {
      console.error("Error calling Imagga API:", err);
    }

    // If analysis fails, return no suggestion
    return NextResponse.json(
      {
        status: "success",
        message: "Image analysis not available",
        suggested_category: null,
        confidence: 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in classify-image API:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to analyze image",
      },
      { status: 500 }
    );
  }
}

// Helper function to classify category based on image tags
function classifyByTags(
  tags: Array<{ tag: { en: string }; confidence: number }>,
  categories: Array<{ id: string; name: string }>
) {
  // Simple keyword matching for categories
  const categoryKeywords: { [key: string]: string[] } = {
    infrastructure: [
      "road",
      "street",
      "pothole",
      "pavement",
      "asphalt",
      "concrete",
      "sidewalk",
      "traffic",
      "car",
      "vehicle",
      "highway",
      "bridge",
      "asphalt",
      "tarmac",
      "pathway",
    ],
    parks: [
      "park",
      "playground",
      "bench",
      "tree",
      "garden",
      "grass",
      "green",
      "nature",
      "forest",
      "outdoor",
    ],
    waste: [
      "trash",
      "garbage",
      "bin",
      "dirty",
      "rubbish",
      "litter",
      "waste",
      "dump",
      "refuse",
    ],
    public_facilities: [
      "building",
      "light",
      "lamp",
      "pole",
      "utility",
      "sign",
      "public",
      "facility",
      "monument",
      "structure",
    ],
    environment: [
      "water",
      "flood",
      "pollution",
      "river",
      "sea",
      "environmental",
      "nature",
      "environmental damage",
      "rain",
      "creek",
    ],
    safety: [
      "graffiti",
      "vandalism",
      "accident",
      "fire",
      "broken",
      "damage",
      "hazard",
      "dangerous",
      "crime",
      "wreck",
    ],
  };

  // Find best matching category based on tags
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const tag of tags) {
    const tagName = tag.tag.en.toLowerCase();
    const confidence = tag.confidence || 0;

    for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (tagName.includes(keyword)) {
          const score = confidence;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = categoryName;
          }
        }
      }
    }
  }

  // Find category ID
  let suggestedCategoryId = null;
  if (bestMatch && categories && Array.isArray(categories)) {
    const matchedCategory = categories.find(
      (cat: { id: string; name: string }) =>
        cat.name.toLowerCase().includes(bestMatch || "")
    );
    if (matchedCategory) {
      suggestedCategoryId = matchedCategory.id;
    }
  }

  return {
    status: "success",
    message: "Image analysis completed",
    suggested_category: suggestedCategoryId,
    suggested_label: bestMatch,
    confidence: bestScore,
    tags: tags.map(t => ({ tag: t.tag.en, confidence: t.confidence })),
  };
}
