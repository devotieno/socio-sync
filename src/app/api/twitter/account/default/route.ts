import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Set default Twitter account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    // Get current user data
    const userDocRef = doc(db, 'users', session.user.id);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    if (!userData?.connectedAccounts) {
      return NextResponse.json({ error: 'No connected accounts found' }, { status: 404 });
    }

    // Find the Twitter account to set as default
    const targetAccount = userData.connectedAccounts.find(
      (account: any) => account.platform === 'twitter' && account.accountId === accountId
    );

    if (!targetAccount) {
      return NextResponse.json({ error: 'Twitter account not found' }, { status: 404 });
    }

    // Update all Twitter accounts to remove default flag, then set the target as default
    const updatedAccounts = userData.connectedAccounts.map((account: any) => {
      if (account.platform === 'twitter') {
        return {
          ...account,
          isDefault: account.accountId === accountId
        };
      }
      return account;
    });

    await setDoc(userDocRef, {
      ...userData,
      connectedAccounts: updatedAccounts,
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Default Twitter account updated successfully',
    });
  } catch (error) {
    console.error('Set default account error:', error);
    return NextResponse.json(
      { error: 'Failed to set default account' },
      { status: 500 }
    );
  }
}
