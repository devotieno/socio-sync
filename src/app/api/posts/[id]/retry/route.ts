import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { publishToSocialMedia } from '@/lib/social-media-publisher';
import { SocialMediaPost } from '@/types/post';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = await params;
    
    // First, verify the post exists and belongs to the user
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const postData = postSnap.data();
    if (postData.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Only allow retrying failed posts
    if (postData.status !== 'failed') {
      return NextResponse.json({ 
        error: 'Can only retry failed posts' 
      }, { status: 400 });
    }
    
    // Update status to scheduled and try publishing again
    await updateDoc(postRef, {
      status: 'scheduled',
      updatedAt: new Date(),
    });
    
    // Attempt to publish
    try {
      await publishToSocialMedia(postId, postData as Omit<SocialMediaPost, 'id'>, session.user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Post retry successful',
      });
      
    } catch (publishError) {
      console.error('Error retrying post:', publishError);
      
      // Update back to failed status
      await updateDoc(postRef, {
        status: 'failed',
        updatedAt: new Date(),
      });
      
      return NextResponse.json({ 
        error: 'Retry failed - please check your social media connections and try again',
        details: publishError instanceof Error ? publishError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error retrying post:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
