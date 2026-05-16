import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST() {
  if (!adminDb) {
    return NextResponse.json({ error: 'No admin database available' }, { status: 500 });
  }

  try {
    const snapshot = await adminDb.collection('contents').where('type', '==', 'anime').get();
    
    let count = 0;
    const batches = [];
    let currentBatch = adminDb.batch();
    
    snapshot.docs.forEach((doc) => {
      currentBatch.delete(doc.ref);
      count++;
      
      if (count % 400 === 0) {
        batches.push(currentBatch.commit());
        currentBatch = adminDb!.batch();
      }
    });

    if (count % 400 !== 0) {
      batches.push(currentBatch.commit());
    }

    await Promise.all(batches);

    return NextResponse.json({ success: true, deletedCount: count });
  } catch (error: any) {
    console.error('Error deleting animes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
