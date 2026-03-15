import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyB2WTD9DwWM-9TJzX_ZRiMpKwITtPySJdQ',
  authDomain:        'boxtracker-e4367.firebaseapp.com',
  projectId:         'boxtracker-e4367',
  storageBucket:     'boxtracker-e4367.firebasestorage.app',
  messagingSenderId: '306539297846',
  appId:             '1:306539297846:web:c1f4583e9e8aa8e38dac97',
  measurementId:     'G-LBCBZCZ3CQ',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence (so it works without internet)
enableIndexedDbPersistence(db).catch(() => {});
