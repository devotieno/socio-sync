import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Debug endpoint to check user data structure
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user document from Firestore
    const userDocRef = doc(db, 'users', session.user.id);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({
        message: 'No user document found',
        session: {
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name,
        }
      });
    }

    const userData = userDoc.data();
    
    return NextResponse.json({
      message: 'User document found',
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      userDocument: {
        hasTwitterAccount: !!userData?.twitterAccount,
        hasConnectedAccounts: !!userData?.connectedAccounts,
        connectedAccountsCount: userData?.connectedAccounts?.length || 0,
        connectedPlatforms: userData?.connectedAccounts?.map((acc: any) => acc.platform) || [],
        twitterAccountStructure: userData?.twitterAccount ? Object.keys(userData.twitterAccount) : null,
        // Include actual data for debugging (remove in production)
        fullConnectedAccounts: userData?.connectedAccounts || null,
        fullTwitterAccount: userData?.twitterAccount || null,
      }
    });
    
  } catch (error) {
    console.error('User debug error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
