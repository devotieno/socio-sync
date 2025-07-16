import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v18.0';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { caption, instagramAccountId, accessToken, mediaUrl, mediaType = 'IMAGE' } = body;

    if (!instagramAccountId || !accessToken) {
      return NextResponse.json({ error: 'Instagram account ID and access token are required' }, { status: 400 });
    }

    if (!mediaUrl && !caption) {
      return NextResponse.json({ error: 'Media URL or caption is required' }, { status: 400 });
    }

    try {
      let containerId: string;

      if (mediaUrl) {
        // Step 1: Create media container
        const containerData: any = {
          access_token: accessToken,
        };

        if (mediaType === 'VIDEO') {
          containerData.media_type = 'VIDEO';
          containerData.video_url = mediaUrl;
        } else {
          containerData.image_url = mediaUrl;
        }

        if (caption) {
          containerData.caption = caption;
        }

        const containerResponse = await fetch(`${FACEBOOK_GRAPH_URL}/${instagramAccountId}/media`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(containerData),
        });

        if (!containerResponse.ok) {
          const error = await containerResponse.json();
          return NextResponse.json({ 
            error: 'Failed to create media container', 
            details: error.error?.message 
          }, { status: containerResponse.status });
        }

        const containerResult = await containerResponse.json();
        containerId = containerResult.id;

        // For videos, we need to wait for processing
        if (mediaType === 'VIDEO') {
          let attempts = 0;
          const maxAttempts = 30; // 5 minutes max wait
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
            
            const statusResponse = await fetch(`${FACEBOOK_GRAPH_URL}/${containerId}?fields=status_code&access_token=${accessToken}`);
            const statusData = await statusResponse.json();
            
            if (statusData.status_code === 'FINISHED') {
              break;
            } else if (statusData.status_code === 'ERROR') {
              return NextResponse.json({ error: 'Video processing failed' }, { status: 400 });
            }
            
            attempts++;
          }
          
          if (attempts >= maxAttempts) {
            return NextResponse.json({ error: 'Video processing timeout' }, { status: 408 });
          }
        }
      } else {
        // Text-only post (not supported on Instagram directly)
        return NextResponse.json({ error: 'Instagram requires media content' }, { status: 400 });
      }

      // Step 2: Publish the media
      const publishResponse = await fetch(`${FACEBOOK_GRAPH_URL}/${instagramAccountId}/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      });

      if (!publishResponse.ok) {
        const error = await publishResponse.json();
        return NextResponse.json({ 
          error: 'Failed to publish media', 
          details: error.error?.message 
        }, { status: publishResponse.status });
      }

      const publishResult = await publishResponse.json();

      return NextResponse.json({
        success: true,
        postId: publishResult.id,
        platform: 'instagram',
        containerId: containerId,
      });

    } catch (error) {
      console.error('Instagram posting error:', error);
      return NextResponse.json({ error: 'Failed to post to Instagram' }, { status: 500 });
    }

  } catch (error) {
    console.error('Instagram post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
