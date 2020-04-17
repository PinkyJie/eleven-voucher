import admin from 'firebase-admin';

admin.initializeApp();

export const firestoreDb = admin.firestore();
export const firebaseAuth = admin.auth();
