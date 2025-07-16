import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwitterManualAuth } from '@/lib/twitter-manual-auth';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Complete PIN-based Twitter authentication
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { requestToken, requestTokenSecret, pin } = body;

    if (!requestToken || !requestTokenSecret || !pin) {
      return NextResponse.json({ 
        error: 'Request token, request token secret, and PIN are required' 
      }, { status: 400 });
    }

    // Initialize Twitter manual authentication
    const twitterAuth = new TwitterManualAuth();
    
    // Complete authentication with PIN
    const authResult = await twitterAuth.completeAuthWithPIN(
      requestToken,
      requestTokenSecret,
      pin
    );

    if (!authResult.success) {
      return NextResponse.json({ 
        error: authResult.error || 'Authentication failed' 
      }, { status: 401 });
    }

    if (!authResult.user || !authResult.tokens) {
      return NextResponse.json({ 
        error: 'Authentication succeeded but user data is missing' 
      }, { status: 500 });
    }

    // Save to user's connected accounts
    const userDocRef = doc(db, 'users', session.user.id);
    const userDoc = await getDoc(userDocRef);
    
    const userData = userDoc.data() || {};
    const connectedAccounts = userData.connectedAccounts || [];
    
    // Check if this Twitter account is already connected
    const existingAccount = connectedAccounts.find(
      (account: any) => account.platform === 'twitter' && 
                      account.accountId === authResult.user!.id
    );

    if (existingAccount) {
      return NextResponse.json({ 
        error: 'This Twitter account is already connected' 
      }, { status: 409 });
    }

    // Check if this is the first Twitter account for this user
    const isFirstTwitterAccount = !connectedAccounts.some(
      (account: any) => account.platform === 'twitter'
    );

    // Add new Twitter account
    const twitterAccount = {
      platform: 'twitter',
      accountId: authResult.user.id,
      username: authResult.user.username,
      displayName: authResult.user.name,
      profileImage: authResult.user.profile_image_url,
      followers: authResult.user.followers_count,
      accessToken: authResult.tokens.accessToken,
      refreshToken: authResult.tokens.accessTokenSecret,
      connectedAt: new Date().toISOString(),
      isDefault: isFirstTwitterAccount,
      connectionType: 'pin_auth',
    };

    connectedAccounts.push(twitterAccount);

    // Update user document
    await setDoc(userDocRef, {
      ...userData,
      connectedAccounts: connectedAccounts,
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Twitter account connected successfully',
      account: {
        id: authResult.user.id,
        username: authResult.user.username,
        name: authResult.user.name,
        profile_image_url: authResult.user.profile_image_url,
        followers_count: authResult.user.followers_count,
      },
    });

  } catch (error) {
    console.error('Twitter PIN auth completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
