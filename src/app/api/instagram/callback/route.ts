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
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/instagram/callback`,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get Instagram business accounts
    const accountsResponse = await fetch(`${FACEBOOK_GRAPH_URL}/me/accounts?access_token=${accessToken}`);
    const accountsData = await accountsResponse.json();

    // Get Instagram accounts connected to Facebook pages
    const instagramAccounts = [];
    if (accountsData.data) {
      for (const page of accountsData.data) {
        try {
          const igResponse = await fetch(`${FACEBOOK_GRAPH_URL}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
          const igData = await igResponse.json();
          
          if (igData.instagram_business_account) {
            instagramAccounts.push({
              pageId: page.id,
              pageName: page.name,
              instagramAccountId: igData.instagram_business_account.id,
              accessToken: page.access_token,
            });
          }
        } catch (error) {
          console.log(`No Instagram account for page ${page.id}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      accounts: instagramAccounts,
      accessToken: accessToken,
    });

  } catch (error) {
    console.error('Instagram callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
