import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwitterApi } from 'twitter-api-v2';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check Twitter API rate limits using the bearer token
    try {
      const bearerClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
      
      // Get rate limit status for various endpoints
      const rateLimitData = await bearerClient.v1.get('application/rate_limit_status.json', {
        resources: 'statuses,users,help'
      });

      // Extract relevant rate limits
      const tweetLimits = rateLimitData.resources?.statuses?.['/statuses/update'] || {};
      const userLimits = rateLimitData.resources?.users?.['/users/lookup'] || {};

      const currentTime = Math.floor(Date.now() / 1000);
      
      return NextResponse.json({
        success: true,
        rateLimits: {
          tweets: {
            limit: tweetLimits.limit || 300,
            remaining: tweetLimits.remaining || 0,
            resetTime: tweetLimits.reset || currentTime + 900,
            resetIn: Math.max(0, (tweetLimits.reset || currentTime + 900) - currentTime),
          },
          users: {
            limit: userLimits.limit || 300,
            remaining: userLimits.remaining || 0,
            resetTime: userLimits.reset || currentTime + 900,
            resetIn: Math.max(0, (userLimits.reset || currentTime + 900) - currentTime),
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (apiError: any) {
      console.error('Error checking Twitter rate limits:', apiError);
      
      if (apiError.code === 429) {
        return NextResponse.json({
          success: true,
          rateLimits: {
            tweets: {
              limit: 300,
              remaining: 0,
              resetTime: Math.floor(Date.now() / 1000) + 900,
              resetIn: 900,
            }
          },
          rateLimited: true,
          message: 'Twitter API rate limit exceeded'
        });
      }
      
      throw apiError;
    }
  } catch (error) {
    console.error('Error in Twitter rate limit check:', error);
    return NextResponse.json(
      { error: 'Failed to check Twitter rate limits' },
      { status: 500 }
    );
  }
}
