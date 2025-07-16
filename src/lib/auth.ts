import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import TwitterProvider from 'next-auth/providers/twitter';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: '2.0',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          
          const user = userCredential.user;
          
          return {
            id: user.uid,
            email: user.email,
            name: user.displayName,
            image: user.photoURL,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.uid = user.id;
      }
      if (account?.provider === 'google') {
        token.accessToken = account.access_token;
      }
      if (account?.provider === 'twitter') {
        token.twitterAccessToken = account.access_token;
        token.twitterRefreshToken = account.refresh_token;
        token.isTwitterAccount = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        // Store Twitter info in session for later use
        if (token.isTwitterAccount) {
          // We can access this via token if needed
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // If user signs in with Twitter, trigger account setup
      if (account?.provider === 'twitter') {
        try {
          // This will be handled after the session is created
          console.log('Twitter sign-in detected, will set up account');
        } catch (error) {
          console.error('Twitter setup error:', error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
