// ─────────────────────────────────────────────────────────────
//  firestore.js  —  Firestore operations (web SDK)
// ─────────────────────────────────────────────────────────────
import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, getDocs, query, orderBy, limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

function boxesCol(code) {
  return collection(db, 'households', code, 'boxes');
}

// Check if a household exists by looking for any boxes in its subcollection
// (the parent document is never explicitly created)
export async function householdExists(code) {
  const snap = await getDocs(query(boxesCol(code), limit(1)));
  return !snap.empty;
}

export async function syncBoxToCloud(code, box) {
  await setDoc(doc(boxesCol(code), box.id), box);
}

export async function deleteBoxFromCloud(code, boxId) {
  await deleteDoc(doc(boxesCol(code), boxId));
}

export function subscribeToBoxes(code, onUpdate) {
  const q = query(boxesCol(code), orderBy('created', 'asc'));
  return onSnapshot(q, snap => {
    onUpdate(snap.docs.map(d => d.data()));
  });
}

export async function fetchBoxes(code) {
  const q = query(boxesCol(code), orderBy('created', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function pushAllBoxes(code, boxes) {
  const batch = writeBatch(db);
  boxes.forEach(box => batch.set(doc(boxesCol(code), box.id), box));
  await batch.commit();
}
