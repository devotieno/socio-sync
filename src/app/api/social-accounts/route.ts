import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SocialMediaAccount, SocialMediaAccountConnection } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Firebase Admin SDK for server-side operations
    const admin = await import('firebase-admin');
    
    // Initialize Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    const db = admin.firestore();
    let accounts: any[] = [];

    // Check users collection for connectedAccounts
    const userDocRef = db.collection('users').doc(session.user.id);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('User data found:', userData);
      
      if (userData?.connectedAccounts && Array.isArray(userData.connectedAccounts)) {
        console.log('Found connectedAccounts in users collection:', userData.connectedAccounts);
        accounts = userData.connectedAccounts.map((account: any) => ({
          id: account.accountId,
          platform: account.platform,
          username: account.username || account.displayName,
          avatar: account.profileImage || '',
          accountId: account.accountId,
          isActive: true,
        }));
      }
    }

    console.log('Final processed accounts:', accounts);

    // Create connection status for Twitter only
    const connections: SocialMediaAccountConnection[] = [{
      platform: 'twitter' as any,
      isConnected: accounts.length > 0,
      accountName: accounts[0]?.username,
      accountId: accounts[0]?.accountId,
    }];

    return NextResponse.json({
      success: true,
      accounts: accounts,
      connections: connections,
    });
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social accounts' },
      { status: 500 }
    );
  }
}
