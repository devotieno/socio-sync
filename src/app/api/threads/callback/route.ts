import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('Threads OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/accounts?error=threads_auth_failed`);
  }

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not provided' }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.THREADS_APP_ID!,
        client_secret: process.env.THREADS_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/threads/callback`,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Threads token exchange failed:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, user_id } = tokenData;

    // Get user profile information
    const profileResponse = await fetch(
      `https://graph.threads.net/${user_id}?fields=id,username,threads_profile_picture_url&access_token=${access_token}`
    );

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profileData = await profileResponse.json();

    // Store the account information
    // In a real app, you would store this in your database
    const accountData = {
      id: `threads_${user_id}`,
      platform: 'threads',
      platformId: user_id,
      name: profileData.username,
      username: profileData.username,
      profilePicture: profileData.threads_profile_picture_url,
      accessToken: access_token,
      connectedAt: new Date().toISOString(),
      userId: session.user?.email || session.user?.id,
    };

    // For now, store in localStorage (in production, use a proper database)
    const redirectUrl = new URL(`${process.env.NEXTAUTH_URL}/dashboard/accounts`);
    redirectUrl.searchParams.set('threads_connected', 'true');
    redirectUrl.searchParams.set('account_data', Buffer.from(JSON.stringify(accountData)).toString('base64'));

    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Threads OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/accounts?error=threads_connection_failed`);
  }
}
