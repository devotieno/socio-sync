import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

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
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/linkedin/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('LinkedIn token exchange failed:', error);
      return NextResponse.json({ error: 'Failed to exchange authorization code' }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user profile
    const profileResponse = await fetch(`${LINKEDIN_API_URL}/people/~:(id,firstName,lastName,emailAddress)`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const profileData = await profileResponse.json();

    // Get user's organizations (companies they can post for)
    const orgResponse = await fetch(`${LINKEDIN_API_URL}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&projection=(elements*(organization~(id,name)))`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    let organizations = [];
    if (orgResponse.ok) {
      const orgData = await orgResponse.json();
      organizations = orgData.elements?.map((element: any) => ({
        id: element.organization?.id,
        name: element.organization?.name,
      })) || [];
    }

    return NextResponse.json({
      success: true,
      profile: profileData,
      organizations: organizations,
      accessToken: accessToken,
    });

  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
