import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SocialMediaAccount, SocialMediaAccountConnection } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let accounts: any[] = [];

    // First, try to fetch from socialAccounts collection
    const accountsQuery = query(
      collection(db, 'socialAccounts'),
      where('userId', '==', session.user.id),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(accountsQuery);
    console.log('socialAccounts query snapshot size:', querySnapshot.size);
    console.log('User ID:', session.user.id);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Raw socialAccounts data:', { docId: doc.id, ...data });
      accounts.push({
        id: doc.id,
        platform: data.platform,
        username: data.accountName,
        avatar: data.avatar || '',
        accountId: data.accountId,
        isActive: data.isActive,
      });
    });

    // If no accounts found in socialAccounts, check users collection for connectedAccounts
    if (accounts.length === 0) {
      console.log('No accounts found in socialAccounts, checking users collection...');
      const userDocRef = doc(db, 'users', session.user.id);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data found:', userData);
        
        if (userData?.connectedAccounts && Array.isArray(userData.connectedAccounts)) {
          console.log('Found connectedAccounts in users collection:', userData.connectedAccounts);
          accounts = userData.connectedAccounts.map((account: any) => ({
            id: account.accountId,
            platform: account.platform,
            username: account.username || account.displayName,
            avatar: account.profileImage || '',
            accountId: account.accountId,
            isActive: true,
          }));
        }
      }
    }

    console.log('Final processed accounts:', accounts);

    // Create connection status for all supported platforms
    const supportedPlatforms = ['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'threads', 'youtube'];
    const connections: SocialMediaAccountConnection[] = supportedPlatforms.map(platform => {
      const account = accounts.find(acc => acc.platform === platform);
      return {
        platform: platform as any,
        isConnected: !!account,
        accountName: account?.username,
        accountId: account?.accountId,
      };
    });

    return NextResponse.json({
      success: true,
      accounts: accounts,
      connections: connections,
    });
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social accounts' },
      { status: 500 }
    );
  }
}
