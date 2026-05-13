import { NextResponse } from 'next/server';

export async function GET() {
  const hfKey = process.env.HF_API_KEY;
  
  return NextResponse.json({
    HF_API_KEY_exists: !!hfKey,
    HF_API_KEY_length: hfKey?.length || 0,
    HF_API_KEY_preview: hfKey ? `${hfKey.substring(0, 10)}...${hfKey.substring(hfKey.length - 5)}` : 'NOT SET',
    all_env_keys: Object.keys(process.env).filter(k => k.includes('HF') || k.includes('SUPABASE')).sort(),
  });
}
