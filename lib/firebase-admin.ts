import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';

let app;
if (!getApps().length) {
  try {
    app = initializeApp({
      credential: applicationDefault()
    });
  } catch (e: any) {
    console.error('Firebase admin init error', e);
  }
} else {
  app = getApps()[0];
}

export const adminDb = app ? getFirestore(app) : null;
export const adminAuth = app ? getAuth(app) : null;
