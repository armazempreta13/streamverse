import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const isServer = typeof window === 'undefined';
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  if (isServer) {
    initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);
  }
} else {
  app = getApp();
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Lazy initialization of auth to prevent SSR errors
let authInstance: any = null;
export const auth = new Proxy({}, {
  get: (target, prop) => {
    if (isServer) return null; // Don't access auth on the server
    if (!authInstance) {
      authInstance = getAuth(app);
    }
    return authInstance[prop];
  }
}) as ReturnType<typeof getAuth>;
