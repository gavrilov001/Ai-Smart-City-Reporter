import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to diagnose Hugging Face API integration
 * Run this to see detailed logs about the AI analysis
 */
export async function POST(req: NextRequest) {
  const HF_API_KEY = process.env.HF_API_KEY;
  const HF_API_URL = 'https://api-inference.huggingface.co/models';

  console.log('🧪 TEST HF API');
  console.log('HF_API_KEY present:', !!HF_API_KEY);
  console.log('HF_API_KEY length:', HF_API_KEY?.length);

  // Get a test image from the request body
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  console.log('📸 File:', file.name, 'Size:', file.size, 'Type:', file.type);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📦 Buffer size:', buffer.length);
    console.log('🔗 Calling:', `${HF_API_URL}/google/vit-base-patch16-224`);
    console.log('🔑 Auth header:', `Bearer ${HF_API_KEY?.substring(0, 10)}...`);

    const response = await fetch(
      `${HF_API_URL}/google/vit-base-patch16-224`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/octet-stream',
        },
        body: buffer,
      }
    );

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers));

    const responseText = await response.text();
    console.log('📡 Response body:', responseText.substring(0, 500));

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { raw_response: responseText };
    }

    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      result: result,
      debug: {
        fileSize: file.size,
        bufferSize: buffer.length,
        apiKeyLength: HF_API_KEY?.length,
      },
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
