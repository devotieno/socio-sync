import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get connected accounts
    const accountsQuery = query(
      collection(db, 'socialAccounts'),
      where('userId', '==', session.user.id),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(accountsQuery);
    const accounts: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      accounts.push({
        id: doc.id,
        accountId: doc.id,
        platform: data.platform,
        username: data.username,
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        status: data.status,
        isActive: data.isActive,
        connectedAt: data.connectedAt,
      });
    });

    return NextResponse.json({
      success: true,
      userId: session.user.id,
      accountsFound: accounts.length,
      accounts: accounts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug accounts error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
