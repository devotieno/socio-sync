import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Facebook OAuth URL
    const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    
    const params = {
      client_id: process.env.FACEBOOK_APP_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/facebook/callback`,
      scope: 'email,public_profile', // Only basic permissions that work without app review
      response_type: 'code',
      state: `facebook_${session.user.id}_${Date.now()}`, // CSRF protection
    };

    Object.entries(params).forEach(([key, value]) => {
      facebookAuthUrl.searchParams.append(key, value);
    });

    return NextResponse.json({
      authUrl: facebookAuthUrl.toString(),
    });

  } catch (error) {
    console.error('Facebook auth initiation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
