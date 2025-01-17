import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { stringIsNullOrEmpty } from "../utils/helpers";

const initializeFirebaseAdmin = (): void => {
  try {
    // Check if app is already initialized to prevent multiple initializations
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
};

initializeFirebaseAdmin();

export const firestoreClient = (): Firestore => {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (stringIsNullOrEmpty(projectId)) {
    throw new Error("Missing required environment variable for Firestore project ID");
  }

  return getFirestore(`${process.env.DATABASE_ID}`);
};

export const firestoreConfiguration = (): boolean => {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  return (
    projectId !== undefined &&
    projectId.trim() !== ""
  );
};