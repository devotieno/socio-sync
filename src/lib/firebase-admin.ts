import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // For development, use the service account key file if available
    // Or fall back to using project ID with default credentials
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      // Use explicit credentials if provided
      const serviceAccount = {
        projectId: projectId,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId,
      });
    } else {
      // For development, we'll create a fallback that bypasses auth for local development
      console.warn('Firebase Admin credentials not found, using minimal config for development');
      
      // This won't work for production but allows development to continue
      admin.initializeApp({
        projectId: projectId,
      });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    // Initialize with just project ID as fallback
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;
