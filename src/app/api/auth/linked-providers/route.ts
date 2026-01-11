import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user document from Firestore
    const userDoc = await adminDb.collection('users').doc(session.user.id).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({
        linkedProviders: [],
        email: session.user.email,
        displayName: session.user.name,
      });
    }

    const userData = userDoc.data();
    
    return NextResponse.json({
      linkedProviders: userData?.linkedProviders || [],
      email: userData?.email,
      displayName: userData?.displayName,
    });

  } catch (error: any) {
    console.error('Error fetching linked providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch linked providers', details: error.message },
      { status: 500 }
    );
  }
}
