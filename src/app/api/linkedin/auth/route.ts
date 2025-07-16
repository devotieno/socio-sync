import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // LinkedIn OAuth URL
    const linkedinAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    
    const params = {
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/linkedin/callback`,
      scope: 'profile,email', // Only basic scopes that work without approval
      state: `linkedin_${session.user.id}_${Date.now()}`,
    };

    Object.entries(params).forEach(([key, value]) => {
      linkedinAuthUrl.searchParams.append(key, value);
    });

    return NextResponse.json({
      authUrl: linkedinAuthUrl.toString(),
    });

  } catch (error) {
    console.error('LinkedIn auth initiation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
