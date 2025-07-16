import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
    
    // Get post data
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const postData = postSnap.data();
    if (postData.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // For now, return mock analytics data
    // In a real implementation, you would fetch from social media APIs
    const mockAnalytics = {
      id: postId,
      totalEngagement: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      views: Math.floor(Math.random() * 5000),
      clickThroughRate: (Math.random() * 5).toFixed(2),
      engagementRate: (Math.random() * 10).toFixed(2),
      platformMetrics: {
        twitter: {
          likes: Math.floor(Math.random() * 200),
          retweets: Math.floor(Math.random() * 50),
          replies: Math.floor(Math.random() * 25),
          views: Math.floor(Math.random() * 2000),
        },
        facebook: {
          likes: Math.floor(Math.random() * 150),
          shares: Math.floor(Math.random() * 30),
          comments: Math.floor(Math.random() * 20),
          views: Math.floor(Math.random() * 1500),
        },
      },
      timeSeriesData: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        engagement: Math.floor(Math.random() * 100),
        views: Math.floor(Math.random() * 500),
      })),
      topPerformingTime: '2:00 PM - 4:00 PM',
      audienceDemographics: {
        ageGroups: {
          '18-24': 25,
          '25-34': 35,
          '35-44': 25,
          '45-54': 10,
          '55+': 5,
        },
        gender: {
          male: 45,
          female: 52,
          other: 3,
        },
        topCountries: [
          { country: 'United States', percentage: 45 },
          { country: 'United Kingdom', percentage: 15 },
          { country: 'Canada', percentage: 12 },
          { country: 'Australia', percentage: 8 },
          { country: 'Germany', percentage: 7 },
        ],
      },
    };
    
    return NextResponse.json({
      success: true,
      analytics: mockAnalytics,
      post: {
        id: postSnap.id,
        ...postData,
        createdAt: postData.createdAt?.toDate?.()?.toISOString() || postData.createdAt,
        publishedAt: postData.publishedAt?.toDate?.()?.toISOString() || postData.publishedAt,
      },
    });

  } catch (error) {
    console.error('Error fetching post analytics:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
