import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Instagram uses Facebook's OAuth with Instagram-specific scopes
    const instagramAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    
    const params = {
      client_id: process.env.FACEBOOK_APP_ID!, // Instagram uses Facebook app
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/instagram/callback`,
      scope: 'instagram_basic,instagram_content_publish,instagram_manage_insights',
      response_type: 'code',
      state: `instagram_${session.user.id}_${Date.now()}`,
    };

    Object.entries(params).forEach(([key, value]) => {
      instagramAuthUrl.searchParams.append(key, value);
    });

    return NextResponse.json({
      authUrl: instagramAuthUrl.toString(),
    });

  } catch (error) {
    console.error('Instagram auth initiation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
