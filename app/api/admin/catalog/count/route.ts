import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, limit, getDocs } from 'firebase/firestore/lite';

export async function GET() {
  try {
    const snap = await getDocs(collection(db, 'contents'));
    return NextResponse.json({ success: true, count: snap.size });
  } catch(e: any) {
    return NextResponse.json({ error: e.message });
  }
}
