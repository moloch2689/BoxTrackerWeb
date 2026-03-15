// ─────────────────────────────────────────────────────────────
//  firebase.js  —  Initialize Firebase Web SDK
//  Replace the config below with your Firebase project's web config
//  from: Firebase Console → Project Settings → Your apps → Web app
// ─────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  // TODO: paste your Firebase web config here
  apiKey:            '',
  authDomain:        '',
  projectId:         '',
  storageBucket:     '',
  messagingSenderId: '',
  appId:             '',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch(() => {});
