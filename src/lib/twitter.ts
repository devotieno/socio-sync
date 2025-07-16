import TwitterProvider from 'next-auth/providers/twitter';
import { TwitterApi } from 'twitter-api-v2';

// Twitter OAuth provider configuration
export const twitterProvider = TwitterProvider({
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  version: '2.0',
  authorization: {
    url: 'https://twitter.com/i/oauth2/authorize',
    params: {
      scope: 'users.read tweet.read tweet.write offline.access',
    },
  },
});

// Twitter API client factory
export function createTwitterClient(accessToken: string) {
  return new TwitterApi(accessToken);
}

// Helper function to validate Twitter token
export async function validateTwitterToken(accessToken: string) {
  try {
    const client = new TwitterApi(accessToken);
    const user = await client.v2.me();
    return { valid: true, user: user.data };
  } catch (error) {
    console.error('Twitter token validation failed:', error);
    return { valid: false, error };
  }
}
