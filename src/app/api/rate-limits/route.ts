import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimitManager } from '@/lib/rate-limit-manager';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const platforms = ['twitter', 'facebook', 'instagram', 'linkedin'];
    const status: { [key: string]: any } = {};

    platforms.forEach(platform => {
      status[platform] = rateLimitManager.getStatus(platform);
    });

    return NextResponse.json({
      success: true,
      rateLimits: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Rate limit status error:', error);
    return NextResponse.json({
      error: 'Failed to get rate limit status'
    }, { status: 500 });
  }
}
