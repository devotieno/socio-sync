import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, mediaUrl, accessToken, userId } = body;

    if (!content || !accessToken || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: content, accessToken, userId' },
        { status: 400 }
      );
    }

    // Create media container if media is provided
    let mediaContainerId = null;
    if (mediaUrl) {
      const mediaResponse = await fetch(`https://graph.threads.net/${userId}/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_type: mediaUrl.includes('.mp4') || mediaUrl.includes('.mov') ? 'VIDEO' : 'IMAGE',
          image_url: mediaUrl.includes('.mp4') || mediaUrl.includes('.mov') ? undefined : mediaUrl,
          video_url: mediaUrl.includes('.mp4') || mediaUrl.includes('.mov') ? mediaUrl : undefined,
          text: content,
          access_token: accessToken,
        }),
      });

      if (!mediaResponse.ok) {
        const errorData = await mediaResponse.text();
        console.error('Threads media container creation failed:', errorData);
        throw new Error('Failed to create media container');
      }

      const mediaData = await mediaResponse.json();
      mediaContainerId = mediaData.id;

      // Wait for media processing (for videos)
      if (mediaUrl.includes('.mp4') || mediaUrl.includes('.mov')) {
        let processingComplete = false;
        let attempts = 0;
        const maxAttempts = 30; // 5 minutes max

        while (!processingComplete && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
          
          const statusResponse = await fetch(
            `https://graph.threads.net/${mediaContainerId}?fields=status&access_token=${accessToken}`
          );
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            processingComplete = statusData.status === 'FINISHED';
          }
          
          attempts++;
        }

        if (!processingComplete) {
          throw new Error('Media processing timeout');
        }
      }
    }

    // Publish the post
    const publishUrl = `https://graph.threads.net/${userId}/threads_publish`;
    const publishBody: any = {
      access_token: accessToken,
    };

    if (mediaContainerId) {
      publishBody.creation_id = mediaContainerId;
    } else {
      publishBody.text = content;
    }

    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(publishBody),
    });

    if (!publishResponse.ok) {
      const errorData = await publishResponse.text();
      console.error('Threads publish failed:', errorData);
      throw new Error('Failed to publish post');
    }

    const publishData = await publishResponse.json();

    return NextResponse.json({
      success: true,
      postId: publishData.id,
      message: 'Post published successfully to Threads',
      platform: 'threads',
    });

  } catch (error) {
    console.error('Threads posting error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to post to Threads',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
