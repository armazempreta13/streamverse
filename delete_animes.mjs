import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from 'fs';

const cfg = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(cfg);
const db = getFirestore(app);

async function run() {
  const q = collection(db, 'contents');
  const snap = await getDocs(q);
  console.log(`Found ${snap.docs.length} docs`);
  for (const item of snap.docs) {
    const data = item.data();
    await deleteDoc(doc(db, 'contents', item.id));
    console.log('Deleted', data.title);
  }
}
run();
