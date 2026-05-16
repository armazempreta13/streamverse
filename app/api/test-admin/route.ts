import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  if (!adminDb) return NextResponse.json({ error: 'No admin DB' });
  try {
    const snap = await adminDb.collection('contents').limit(1).get();
    return NextResponse.json({ success: true, count: snap.size });
  } catch(e: any) {
    return NextResponse.json({ error: e.message });
  }
}
