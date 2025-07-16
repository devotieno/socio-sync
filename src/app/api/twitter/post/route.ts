import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwitterApi } from 'twitter-api-v2';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { rateLimitManager } from '@/lib/rate-limit-manager';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, mediaUrls, scheduledFor } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tweet content is required' },
        { status: 400 }
      );
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: 'Tweet content exceeds 280 characters' },
        { status: 400 }
      );
    }

    // Get user's Twitter account
    const accountDoc = await getDoc(
      doc(db, 'socialAccounts', `${session.user.id}_twitter`)
    );

    if (!accountDoc.exists() || accountDoc.data()?.status !== 'active') {
      return NextResponse.json(
        { error: 'Twitter account not connected' },
        { status: 400 }
      );
    }

    const accountData = accountDoc.data();
    const client = new TwitterApi(accountData.accessToken);

    let tweetResult;

    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      // Schedule the tweet for later
      const postDoc = await addDoc(collection(db, 'posts'), {
        userId: session.user.id,
        content,
        platforms: ['twitter'],
        mediaUrls: mediaUrls || [],
        scheduledFor: new Date(scheduledFor),
        status: 'scheduled',
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        scheduled: true,
        postId: postDoc.id,
        scheduledFor,
      });
    } else {
      // Post immediately
      try {
        // Handle media uploads if present
        let mediaIds: string[] = [];
        if (mediaUrls && mediaUrls.length > 0) {
          for (const mediaUrl of mediaUrls) {
            try {
              // Download and upload media to Twitter
              const response = await fetch(mediaUrl);
              const buffer = await response.arrayBuffer();
              const mediaUpload = await client.v1.uploadMedia(
                Buffer.from(buffer),
                { mimeType: response.headers.get('content-type') || 'image/jpeg' }
              );
              mediaIds.push(mediaUpload);
            } catch (mediaError) {
              console.error('Media upload error:', mediaError);
              // Continue without media if upload fails
            }
          }
        }

        // Create tweet with rate limit handling
        const tweetData: any = { text: content };
        if (mediaIds.length > 0) {
          tweetData.media = { media_ids: mediaIds };
        }

        // Use rate limit manager to queue the request if necessary
        tweetResult = await rateLimitManager.queueRequest('twitter', async () => {
          try {
            const result = await client.v2.tweet(tweetData);
            
            // Update rate limit info from response headers if available
            // Note: Twitter API v2 doesn't always include rate limit headers in tweet responses
            // Rate limits are typically checked via separate endpoints
            
            return result;
          } catch (error: any) {
            // Check if this is a rate limit error
            if (error.code === 429 || error.message?.includes('rate limit')) {
              // Calculate reset time (Twitter rate limits reset every 15 minutes)
              const resetTime = Math.floor(Date.now() / 1000) + (15 * 60);
              rateLimitManager.updateLimits('twitter', new Headers({
                'x-rate-limit-remaining': '0',
                'x-rate-limit-reset': resetTime.toString(),
                'x-rate-limit-limit': '300' // Twitter v2 limit for posting
              }));
              
              throw new Error('Twitter API rate limit exceeded. The post will be retried later.');
            }
            throw error;
          }
        });

        // Save successful post to database
        await addDoc(collection(db, 'posts'), {
          userId: session.user.id,
          content,
          platforms: ['twitter'],
          mediaUrls: mediaUrls || [],
          status: 'published',
          publishedAt: new Date(),
          createdAt: new Date(),
          platformResults: {
            twitter: {
              success: true,
              tweetId: tweetResult.data.id,
              url: `https://twitter.com/user/status/${tweetResult.data.id}`,
            },
          },
        });

        return NextResponse.json({
          success: true,
          published: true,
          tweetId: tweetResult.data.id,
          url: `https://twitter.com/user/status/${tweetResult.data.id}`,
        });
      } catch (twitterError: any) {
        console.error('Twitter posting error:', twitterError);

        // Save failed post to database
        await addDoc(collection(db, 'posts'), {
          userId: session.user.id,
          content,
          platforms: ['twitter'],
          mediaUrls: mediaUrls || [],
          status: 'failed',
          createdAt: new Date(),
          error: twitterError.message || 'Unknown Twitter API error',
        });

        // Handle specific Twitter API errors
        if (twitterError.code === 187) {
          return NextResponse.json(
            { error: 'Duplicate tweet - this exact content was already posted' },
            { status: 400 }
          );
        }

        if (twitterError.code === 429) {
          return NextResponse.json(
            { error: 'Rate limit exceeded - please try again later' },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { error: `Twitter posting failed: ${twitterError.message}` },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Tweet posting error:', error);
    return NextResponse.json(
      { error: 'Failed to post tweet' },
      { status: 500 }
    );
  }
}
