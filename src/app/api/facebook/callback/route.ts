import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v18.0';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(`${FACEBOOK_GRAPH_URL}/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/facebook/callback`,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Facebook token exchange failed:', error);
      return NextResponse.json({ error: 'Failed to exchange authorization code' }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user information
    const userResponse = await fetch(`${FACEBOOK_GRAPH_URL}/me?fields=id,name,email&access_token=${accessToken}`);
    const userData = await userResponse.json();

    // Get user's pages (for posting)
    const pagesResponse = await fetch(`${FACEBOOK_GRAPH_URL}/me/accounts?access_token=${accessToken}`);
    const pagesData = await pagesResponse.json();

    // TODO: Store the access token and account information in your database
    // For now, we'll return the data
    return NextResponse.json({
      success: true,
      user: userData,
      pages: pagesData.data || [],
      accessToken: accessToken, // In production, don't return this directly
    });

  } catch (error) {
    console.error('Facebook callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
