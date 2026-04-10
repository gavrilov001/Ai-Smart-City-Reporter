import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithHuggingFace } from '@/lib/huggingface';

/**
 * Analyzes an image and returns AI predictions WITHOUT saving anything
 * This is called when user uploads an image to show suggestions
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const buffer = await image.arrayBuffer();
    const prediction = await analyzeImageWithHuggingFace(
      Buffer.from(buffer),
      image.name
    );

    return NextResponse.json({
      status: 'success',
      aiPrediction: prediction ? {
        predictedCategory: prediction.categoryName,
        confidence: prediction.confidence,
        rawLabel: prediction.rawLabel,
      } : null,
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
