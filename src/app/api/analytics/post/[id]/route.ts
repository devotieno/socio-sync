import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = await params;
    
    // Use Firebase Admin SDK
    const admin = await import('firebase-admin');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    const db = admin.firestore();

    // Fetch post data
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postData = postDoc.data();
    
    // Check if post belongs to user
    if (postData?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch analytics data from Firestore
    const analyticsDoc = await db.collection('postAnalytics').doc(postId).get();
    
    if (!analyticsDoc.exists) {
      // Return zero analytics if not found yet
      return NextResponse.json({
        success: true,
        analytics: {
          postId,
          platform: postData?.platforms?.[0] || 'twitter',
          likes: 0,
          retweets: 0,
          replies: 0,
          quotes: 0,
          bookmarks: 0,
          impressions: 0,
          urlClicks: 0,
          userProfileClicks: 0,
          fetchedAt: null,
        },
        post: {
          id: postId,
          content: postData?.content || '',
          status: postData?.status || 'published',
          createdAt: postData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          publishedAt: postData?.publishedAt?.toDate?.()?.toISOString() || null,
        },
      });
    }

    const analyticsData = analyticsDoc.data();
    
    return NextResponse.json({
      success: true,
      analytics: {
        ...analyticsData,
        fetchedAt: analyticsData?.fetchedAt?.toDate?.()?.toISOString() || null,
        createdAt: analyticsData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: analyticsData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      },
      post: {
        id: postId,
        content: postData?.content || '',
        status: postData?.status || 'published',
        createdAt: postData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        publishedAt: postData?.publishedAt?.toDate?.()?.toISOString() || null,
      },
    });

  } catch (error) {
    console.error('Error fetching post analytics:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
