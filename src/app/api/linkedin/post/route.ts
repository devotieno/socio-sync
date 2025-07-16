import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, accessToken, authorId, organizationId, mediaUrl, mediaType } = body;

    if (!content && !mediaUrl) {
      return NextResponse.json({ error: 'Content or media is required' }, { status: 400 });
    }

    if (!accessToken || !authorId) {
      return NextResponse.json({ error: 'Access token and author ID are required' }, { status: 400 });
    }

    try {
      // Determine the author URN
      const author = organizationId ? 
        `urn:li:organization:${organizationId}` : 
        `urn:li:person:${authorId}`;

      let postData: any = {
        author: author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content || '',
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      // Handle media content
      if (mediaUrl) {
        if (mediaType === 'IMAGE' || (!mediaType && (mediaUrl.includes('.jpg') || mediaUrl.includes('.png') || mediaUrl.includes('.jpeg')))) {
          // Image post
          postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
          postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
            {
              status: 'READY',
              description: {
                text: content || '',
              },
              media: mediaUrl, // In production, you'd need to upload the image first
              title: {
                text: 'Shared Image',
              },
            },
          ];
        } else if (mediaType === 'VIDEO' || mediaUrl.includes('.mp4') || mediaUrl.includes('.mov')) {
          // Video post
          postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'VIDEO';
          postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
            {
              status: 'READY',
              description: {
                text: content || '',
              },
              media: mediaUrl, // In production, you'd need to upload the video first
              title: {
                text: 'Shared Video',
              },
            },
          ];
        } else {
          // Article/link post
          postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
          postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
            {
              status: 'READY',
              originalUrl: mediaUrl,
            },
          ];
        }
      }

      const response = await fetch(`${LINKEDIN_API_URL}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('LinkedIn API error:', error);
        return NextResponse.json({ 
          error: 'LinkedIn API error', 
          details: error.message || 'Unknown error',
        }, { status: response.status });
      }

      const result = await response.json();

      return NextResponse.json({
        success: true,
        postId: result.id,
        platform: 'linkedin',
        data: result,
      });

    } catch (error) {
      console.error('LinkedIn posting error:', error);
      return NextResponse.json({ error: 'Failed to post to LinkedIn' }, { status: 500 });
    }

  } catch (error) {
    console.error('LinkedIn post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
