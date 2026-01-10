import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Use Firebase Admin SDK for server-side operations (bypasses security rules)
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
      const userDocRef = db.collection('users').doc(session.user.id);
      const userDoc = await userDocRef.get();
      
      let userData: any = {};
      let connectedAccounts: any[] = [];
      
      if (userDoc.exists) {
        userData = userDoc.data();
        connectedAccounts = userData?.connectedAccounts || [];
      } else {
        // Create the user document if it doesn't exist
        const newUserData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          connectedAccounts: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await userDocRef.set(newUserData);
        userData = newUserData;
        connectedAccounts = [];
      }
      
      // Filter for Twitter accounts only
      const twitterAccounts = connectedAccounts.filter(
        (account: any) => account.platform === 'twitter'
      );

      return NextResponse.json({ 
        accounts: twitterAccounts.map((account: any) => ({
          id: account.accountId,
          accountId: account.accountId,
          username: account.username,
          displayName: account.displayName,
          profileImage: account.profileImage,
          followers: account.followers,
          isDefault: account.isDefault || false,
          connectedAt: account.connectedAt,
          connectionType: account.connectionType || 'unknown'
        }))
      });

    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      
      // Return mock data for development when Firebase fails
      return NextResponse.json({ 
        accounts: [
          {
            id: 'mock_twitter_123',
            username: 'your_username',
            displayName: 'Your Display Name',
            profileImage: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
            followers: 150,
            isDefault: true,
            connectedAt: new Date().toISOString(),
            connectionType: 'development_mock'
          }
        ],
        _note: 'Mock data - Firebase connection failed'
      });
    }

  } catch (error) {
    console.error('Error fetching Twitter accounts:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      accounts: []
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    try {
      // Use Firebase Admin SDK for server-side operations
      const admin = await import('firebase-admin');
      
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
      const userDocRef = db.collection('users').doc(session.user.id);
      const userDoc = await userDocRef.get();
      
      if (!userDoc.exists) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const userData = userDoc.data();
      const connectedAccounts = userData?.connectedAccounts || [];
      
      // Remove the Twitter account
      const updatedAccounts = connectedAccounts.filter(
        (account: any) => !(account.platform === 'twitter' && account.accountId === accountId)
      );

      await userDocRef.update({
        connectedAccounts: updatedAccounts,
        updatedAt: new Date()
      });

      return NextResponse.json({ 
        success: true,
        message: 'Twitter account disconnected successfully'
      });

    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      return NextResponse.json({ 
        error: 'Failed to disconnect account',
        details: firebaseError instanceof Error ? firebaseError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error deleting Twitter account:', error);
    return NextResponse.json({ 
      error: 'Internal server error'
    }, { status: 500 });
  }
}
