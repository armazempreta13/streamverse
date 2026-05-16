import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasKey: !!process.env.NEXT_PUBLIC_TMDB_API_KEY,
    keyPrefix: process.env.NEXT_PUBLIC_TMDB_API_KEY ? process.env.NEXT_PUBLIC_TMDB_API_KEY.substring(0, 4) : 'none',
    envKeys: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')),
    nodeEnv: process.env.NODE_ENV
  });
}
