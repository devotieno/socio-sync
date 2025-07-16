import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteField, getDoc, setDoc } from 'firebase/firestore';

// Reset Twitter account data (for testing)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user data
    const userDocRef = doc(db, 'users', session.user.id);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Handle new connectedAccounts structure
      if (userData?.connectedAccounts) {
        const filteredAccounts = userData.connectedAccounts.filter(
          (account: any) => account.platform !== 'twitter'
        );
        
        await setDoc(userDocRef, {
          ...userData,
          connectedAccounts: filteredAccounts,
          updatedAt: new Date(),
        }, { merge: true });
      }
      
      // Also remove old twitterAccount structure if present
      if (userData?.twitterAccount) {
        await updateDoc(userDocRef, {
          twitterAccount: deleteField(),
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Twitter account data reset successfully',
    });
  } catch (error) {
    console.error('Twitter reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset Twitter account' },
      { status: 500 }
    );
  }
}
