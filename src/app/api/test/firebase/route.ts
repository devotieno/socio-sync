import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

// Diagnostic endpoint to check Firebase connectivity
export async function GET(request: NextRequest) {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to read a small amount of data from Firestore
    const testQuery = query(collection(db, 'posts'), limit(1));
    const snapshot = await getDocs(testQuery);
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection successful',
      docsFound: snapshot.size,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Firebase connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Firebase connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Test endpoint for checking environment variables
export async function POST(request: NextRequest) {
  try {
    const envCheck = {
      hasFirebaseApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasFirebaseAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      hasFirebaseProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasFirebaseStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      hasFirebaseMessagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      hasFirebaseAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };

    return NextResponse.json({
      success: true,
      message: 'Environment check completed',
      envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Environment check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Environment check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
