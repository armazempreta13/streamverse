import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query, writeBatch, doc } from 'firebase/firestore';
import fs from 'fs';
import firebaseConfig from './firebase-applet-config.json';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const q = query(collection(db, 'contents'), limit(10));
    const snap = await getDocs(q);
    console.log("Documents found: ", snap.size);
    snap.forEach(d => console.log(d.id, d.data().title));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
