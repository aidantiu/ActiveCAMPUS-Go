// Firebase Admin SDK for server-side operations
// Use this ONLY in API routes (app/api/*) - never in client components
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

// Initialize Firebase Admin only once
if (getApps().length === 0) {
  // Check if we have service account credentials
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Using service account credentials (recommended for production)
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Using full service account JSON (alternative method)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Fallback for development/testing (limited functionality)
    // This will work for some operations but not all
    console.warn('⚠️  Firebase Admin: No service account credentials found. Some features may not work.');
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
} else {
  adminApp = getApps()[0];
}

// Export Firebase Admin services
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

export default adminApp;
