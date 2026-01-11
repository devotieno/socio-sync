import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, provider, providerAccountId, accessToken, refreshToken } = await request.json();

    if (!email || !provider) {
      return NextResponse.json(
        { error: 'Email and provider are required' },
        { status: 400 }
      );
    }

    // Check if a user with this email already exists
    let existingUser;
    try {
      existingUser = await adminAuth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // No existing user, this is a new account
        return NextResponse.json({ linked: false });
      }
      throw error;
    }

    // User exists - check if they already have this provider
    const providers = existingUser.providerData.map(p => p.providerId);
    const newProviderId = provider === 'google' ? 'google.com' : provider === 'twitter' ? 'twitter.com' : provider;
    
    if (providers.includes(newProviderId)) {
      // Provider already linked
      return NextResponse.json({ 
        linked: true, 
        userId: existingUser.uid,
        alreadyLinked: true 
      });
    }

    // Link the new provider to existing account
    console.log(`Linking ${provider} to existing user ${existingUser.uid}`);

    // Update user document in Firestore to track linked providers
    const userRef = adminDb.collection('users').doc(existingUser.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const linkedProviders = userData?.linkedProviders || [];
      
      if (!linkedProviders.includes(provider)) {
        await userRef.update({
          linkedProviders: [...linkedProviders, provider],
          updatedAt: new Date(),
          [`${provider}Profile`]: {
            providerAccountId,
            linkedAt: new Date(),
          }
        });
      }
    } else {
      // Create user document if it doesn't exist
      await userRef.set({
        email: existingUser.email,
        displayName: existingUser.displayName,
        photoURL: existingUser.photoURL,
        linkedProviders: [provider],
        createdAt: new Date(),
        updatedAt: new Date(),
        [`${provider}Profile`]: {
          providerAccountId,
          linkedAt: new Date(),
        }
      });
    }

    return NextResponse.json({ 
      linked: true, 
      userId: existingUser.uid,
      message: `${provider} account linked successfully`
    });

  } catch (error: any) {
    console.error('Account linking error:', error);
    return NextResponse.json(
      { error: 'Failed to link account', details: error.message },
      { status: 500 }
    );
  }
}
