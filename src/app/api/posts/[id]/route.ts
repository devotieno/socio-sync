import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';

export async function DELETE(
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
    
    // Delete the post
    await deleteDoc(postRef);
    
    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
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
    
    // Only allow editing draft and scheduled posts
    if (postData.status !== 'draft' && postData.status !== 'scheduled') {
      return NextResponse.json({ 
        error: 'Can only edit draft and scheduled posts' 
      }, { status: 400 });
    }
    
    // Update the post
    const updateData = {
      ...body,
      updatedAt: new Date(),
      // Convert scheduledAt to Date if provided
      ...(body.scheduledAt && { scheduledAt: new Date(body.scheduledAt) }),
    };
    
    await updateDoc(postRef, updateData);
    
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
