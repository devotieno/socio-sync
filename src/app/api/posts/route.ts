import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SocialMediaPost, MediaFile } from '@/types/post';
import { publishToSocialMedia } from '@/lib/social-media-publisher';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const content = formData.get('content') as string;
    const platforms = JSON.parse(formData.get('platforms') as string);
    const selectedAccounts = JSON.parse(formData.get('selectedAccounts') as string);
    const publishNow = formData.get('publishNow') === 'true';
    const scheduledAt = formData.get('scheduledAt') as string;

    if (!content || !selectedAccounts || selectedAccounts.length === 0) {
      return NextResponse.json({ 
        error: 'Content and at least one account are required' 
      }, { status: 400 });
    }

    // Handle media file uploads
    const mediaFiles: MediaFile[] = [];
    const uploadedFiles = formData.getAll('mediaFiles') as File[];
    const mediaUploadErrors: string[] = [];
    
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      if (file && file.size > 0) {
        try {
          console.log(`Uploading file: ${file.name}, size: ${file.size}`);
          console.log(`User ID: ${session.user.id}`);
          console.log(`Session:`, { 
            userId: session.user.id, 
            email: session.user.email,
            name: session.user.name 
          });
          
          // Upload to Firebase Storage
          const fileName = `posts/${session.user.id}/${Date.now()}-${file.name}`;
          console.log(`Storage path: ${fileName}`);
          
          const storageRef = ref(storage, fileName);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);

          console.log(`File uploaded successfully: ${downloadURL}`);

          mediaFiles.push({
            id: `media-${Date.now()}-${i}`,
            url: downloadURL,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            size: file.size,
            filename: file.name,
          });
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          console.error('Upload error details:', {
            code: (uploadError as any)?.code,
            message: (uploadError as any)?.message,
            customData: (uploadError as any)?.customData,
          });
          mediaUploadErrors.push(`Failed to upload ${file.name}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }
    }

    // If media uploads failed and user intended to include media, return error
    if (uploadedFiles.length > 0 && mediaFiles.length === 0 && mediaUploadErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Failed to upload media files',
        details: mediaUploadErrors
      }, { status: 400 });
    }

    // Log media upload results
    if (mediaUploadErrors.length > 0) {
      console.warn('Some media files failed to upload:', mediaUploadErrors);
    }
    if (mediaFiles.length > 0) {
      console.log(`Successfully uploaded ${mediaFiles.length} media files`);
    }

    // Create post document
    const postData: Omit<SocialMediaPost, 'id'> = {
      userId: session.user.id,
      content,
      platforms,
      selectedAccounts,
      status: publishNow ? 'published' : 'scheduled',
      mediaFiles,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(publishNow ? { publishedAt: new Date() } : { scheduledAt: new Date(scheduledAt) }),
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'posts'), postData);

    // If publishing now, trigger immediate posting
    if (publishNow) {
      try {
        await publishToSocialMedia(docRef.id, postData, session.user.id);
      } catch (publishError) {
        console.error('Error publishing to social media:', publishError);
        // Update post status to failed
        await updateDoc(doc(db, 'posts', docRef.id), {
          status: 'failed',
          updatedAt: new Date(),
        });
        
        return NextResponse.json({ 
          error: 'Post saved but failed to publish to social media',
          postId: docRef.id
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: publishNow ? 'Post published successfully!' : 'Post scheduled successfully!',
      postId: docRef.id,
      post: { id: docRef.id, ...postData },
    });

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const limitParam = parseInt(searchParams.get('limit') || '50');

    // Build base query - only filter by userId to avoid index issues
    let q = query(
      collection(db, 'posts'),
      where('userId', '==', session.user.id)
    );

    const querySnapshot = await getDocs(q);
    let posts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        scheduledAt: data.scheduledAt?.toDate?.()?.toISOString() || data.scheduledAt,
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt,
      };
    });

    // Apply filters in memory for now
    if (status) {
      posts = posts.filter((post: any) => post.status === status);
    }
    if (platform) {
      posts = posts.filter((post: any) => post.platforms?.includes(platform));
    }

    // Sort by createdAt in descending order
    posts.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({
      success: true,
      posts: posts.slice(0, limitParam),
      total: posts.length,
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
