import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwitterApi } from 'twitter-api-v2';
import { codeVerifierStore, cleanupExpiredVerifiers } from '@/lib/twitter-link-store';

// Link Twitter account to existing user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clean up expired verifiers
    cleanupExpiredVerifiers();

    // Get Twitter OAuth URL for account linking
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/twitter/link/callback`;
    
    // Generate Twitter OAuth 2.0 URL
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      callbackUrl,
      {
        scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
      }
    );

    // Store the code verifier with the state for later verification
    codeVerifierStore.set(state, {
      userId: session.user.id,
      codeVerifier: codeVerifier,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      authUrl: url,
      state: state,
    });
    
  } catch (error) {
    console.error('Twitter link error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Twitter auth URL' },
      { status: 500 }
    );
  }
}
