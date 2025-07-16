import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { codeVerifierStore } from '@/lib/twitter-link-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('Twitter callback received:', {
      code: code ? 'PRESENT' : 'MISSING',
      state: state ? 'PRESENT' : 'MISSING',
      error,
      errorDescription,
      fullUrl: request.url
    });

    if (error) {
      console.error('Twitter OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/accounts?error=twitter_auth_failed&details=${encodeURIComponent(errorDescription || error)}`
      );
    }

    if (!code || !state) {
      console.error('Missing code or state:', { code: !!code, state: !!state });
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/accounts?error=missing_code`
      );
    }

    // Get stored verification data
    const verifierData = codeVerifierStore.get(state);
    if (!verifierData) {
      console.error('No verifier data found for state:', state);
      console.log('Available states:', Array.from(codeVerifierStore.keys()));
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/accounts?error=missing_verifier`
      );
    }

    const { userId, codeVerifier } = verifierData;
    
    // Clean up the stored verifier
    codeVerifierStore.delete(state);

    // Exchange code for tokens
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const {
      client: loggedClient,
      accessToken,
      refreshToken,
    } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/twitter/link/callback`,
    });

    // Get Twitter user info
    const twitterUser = await loggedClient.v2.me({
      'user.fields': ['id', 'name', 'username', 'profile_image_url', 'public_metrics'],
    });

    // Save Twitter account to existing user
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    const userData = userDoc.data() || {};
    const connectedAccounts = userData.connectedAccounts || [];
    
    // Check if this Twitter account is already connected
    const existingTwitterAccount = connectedAccounts.find(
      (account: any) => account.platform === 'twitter' && account.accountId === twitterUser.data.id
    );

    if (existingTwitterAccount) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/accounts?error=account_already_connected`
      );
    }
    
    // Remove any existing Twitter account with the same ID (just in case)
    const filteredAccounts = connectedAccounts.filter(
      (account: any) => !(account.platform === 'twitter' && account.accountId === twitterUser.data.id)
    );
    
    // Check if this is the first Twitter account for this user
    const isFirstTwitterAccount = !filteredAccounts.some(
      (account: any) => account.platform === 'twitter'
    );
    
    // Add new Twitter account
    const twitterAccount = {
      platform: 'twitter',
      accountId: twitterUser.data.id,
      username: twitterUser.data.username,
      displayName: twitterUser.data.name,
      profileImage: twitterUser.data.profile_image_url,
      followers: twitterUser.data.public_metrics?.followers_count || 0,
      accessToken: accessToken,
      refreshToken: refreshToken,
      connectedAt: new Date().toISOString(),
      isDefault: isFirstTwitterAccount, // First Twitter account becomes default
    };
    
    filteredAccounts.push(twitterAccount);
    
    // Update user document
    await setDoc(userDocRef, {
      ...userData,
      connectedAccounts: filteredAccounts,
    }, { merge: true });

    // Redirect back to accounts page with success
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/accounts?success=twitter_linked`
    );
    
  } catch (error) {
    console.error('Twitter link callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/accounts?error=link_failed`
    );
  }
}
