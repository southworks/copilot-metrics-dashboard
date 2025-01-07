import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore, collection } from 'firebase/firestore';
import { stringIsNullOrEmpty } from "../utils/helpers";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const firestoreClient = (): Firestore => {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (stringIsNullOrEmpty(projectId)) {
    throw new Error("Missing required environment variable for Firestore project ID");
  }

  return db;
};

export const firestoreConfiguration = (): boolean => {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  return (
    projectId !== undefined &&
    projectId.trim() !== ""
  );
};