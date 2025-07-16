import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch ALL social accounts from Firestore (including inactive ones for debugging)
    const accountsQuery = query(
      collection(db, 'socialAccounts'),
      where('userId', '==', session.user.id)
    );

    const querySnapshot = await getDocs(accountsQuery);
    const rawAccounts: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      rawAccounts.push({
        docId: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toString() || data.updatedAt,
        expiresAt: data.expiresAt?.toDate?.()?.toString() || data.expiresAt,
      });
    });

    return NextResponse.json({
      success: true,
      userId: session.user.id,
      accountCount: rawAccounts.length,
      rawAccounts: rawAccounts,
    });
  } catch (error: unknown) {
    console.error('Error fetching raw social accounts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch raw social accounts', details: errorMessage },
      { status: 500 }
    );
  }
}
