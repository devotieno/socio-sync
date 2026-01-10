import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('DELETE request received for post');
    console.log('Session:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.error('Unauthorized: No session user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = await params;
    console.log('Attempting to delete post:', postId);
    
    // Use Firebase Admin SDK to bypass security rules
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
    
    // First, verify the post exists and belongs to the user
    const postRef = db.collection('posts').doc(postId);
    const postSnap = await postRef.get();
    
    if (!postSnap.exists) {
      console.error('Post not found:', postId);
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const postData = postSnap.data();
    console.log('Post data userId:', postData?.userId, 'Session userId:', session.user.id);
    
    if (postData?.userId !== session.user.id) {
      console.error('Unauthorized: User does not own this post');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete the post
    await postRef.delete();
    console.log('Post deleted successfully:', postId);
    
    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : '');
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = await params;
    const body = await request.json();
    
    // Use Firebase Admin SDK to bypass security rules
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
    
    // First, verify the post exists and belongs to the user
    const postRef = db.collection('posts').doc(postId);
    const postSnap = await postRef.get();
    
    if (!postSnap.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const postData = postSnap.data();
    if (postData?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Only allow editing draft and scheduled posts
    if (postData.status !== 'draft' && postData.status !== 'scheduled') {
      return NextResponse.json({ 
        error: 'Can only edit draft and scheduled posts' 
      }, { status: 400 });
    }
    
    // Update the post
    const updateData = {
      ...body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Convert scheduledAt to Date if provided
      ...(body.scheduledAt && { scheduledAt: admin.firestore.Timestamp.fromDate(new Date(body.scheduledAt)) }),
    };
    
    await postRef.update(updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
    });

  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
