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
    const { content, pageId, pageAccessToken, mediaUrl, scheduledTime } = body;

    if (!content && !mediaUrl) {
      return NextResponse.json({ error: 'Content or media is required' }, { status: 400 });
    }

    if (!pageId || !pageAccessToken) {
      return NextResponse.json({ error: 'Page ID and access token are required' }, { status: 400 });
    }

    let postData: any = {
      access_token: pageAccessToken,
    };

    // Handle different types of posts
    if (mediaUrl && content) {
      // Photo/video with caption
      if (mediaUrl.includes('.mp4') || mediaUrl.includes('.mov')) {
        // Video post
        postData.description = content;
        postData.source = mediaUrl;
        
        const response = await fetch(`${FACEBOOK_GRAPH_URL}/${pageId}/videos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });

        return await handleFacebookResponse(response);
      } else {
        // Photo post
        postData.message = content;
        postData.url = mediaUrl;
        
        const response = await fetch(`${FACEBOOK_GRAPH_URL}/${pageId}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });

        return await handleFacebookResponse(response);
      }
    } else if (mediaUrl) {
      // Media only
      if (mediaUrl.includes('.mp4') || mediaUrl.includes('.mov')) {
        postData.source = mediaUrl;
        const response = await fetch(`${FACEBOOK_GRAPH_URL}/${pageId}/videos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });

        return await handleFacebookResponse(response);
      } else {
        postData.url = mediaUrl;
        const response = await fetch(`${FACEBOOK_GRAPH_URL}/${pageId}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });

        return await handleFacebookResponse(response);
      }
    } else {
      // Text only post
      postData.message = content;
      
      // Handle scheduled posts
      if (scheduledTime) {
        const scheduledTimestamp = Math.floor(new Date(scheduledTime).getTime() / 1000);
        postData.scheduled_publish_time = scheduledTimestamp;
        postData.published = false;
      }

      const response = await fetch(`${FACEBOOK_GRAPH_URL}/${pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      return await handleFacebookResponse(response);
    }

  } catch (error) {
    console.error('Facebook post error:', error);
    return NextResponse.json({ error: 'Failed to create Facebook post' }, { status: 500 });
  }
}

async function handleFacebookResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json();
    console.error('Facebook API error:', error);
    return NextResponse.json({ 
      error: 'Facebook API error', 
      details: error.error?.message || 'Unknown error',
      code: error.error?.code 
    }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json({
    success: true,
    postId: data.id,
    platform: 'facebook',
    data: data,
  });
}
