import { TwitterApi } from 'twitter-api-v2';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

interface TwitterCredentials {
  username: string;
  password: string;
}

interface TwitterPinAuth {
  authUrl: string;
  requestToken: string;
  requestTokenSecret: string;
}

interface TwitterAuthResult {
  success: boolean;
  user?: {
    id: string;
    username: string;
    name: string;
    profile_image_url: string;
    followers_count: number;
    following_count: number;
  };
  tokens?: {
    accessToken: string;
    accessTokenSecret: string;
  };
  error?: string;
  requiresPIN?: boolean;
  authUrl?: string;
  requestToken?: string;
  requestTokenSecret?: string;
}

export class TwitterManualAuth {
  private apiKey: string;
  private apiSecret: string;
  private oauth: OAuth;

  constructor() {
    this.apiKey = process.env.TWITTER_API_KEY!;
    this.apiSecret = process.env.TWITTER_API_SECRET!;
    
    this.oauth = new OAuth({
      consumer: {
        key: this.apiKey,
        secret: this.apiSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      },
    });
  }

  /**
   * Step 1: Generate PIN-based authentication URL
   * This is more secure than username/password and follows Twitter's OAuth standards
   */
  async initiateAuth(): Promise<TwitterAuthResult> {
    try {
      const requestData = {
        url: 'https://api.twitter.com/oauth/request_token',
        method: 'POST',
        data: {
          oauth_callback: 'oob', // out-of-band (PIN-based) callback
        },
      };

      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...this.oauth.toHeader(this.oauth.authorize(requestData)),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get request token');
      }

      const responseText = await response.text();
      const params = new URLSearchParams(responseText);
      
      const requestToken = params.get('oauth_token');
      const requestTokenSecret = params.get('oauth_token_secret');
      const confirmed = params.get('oauth_callback_confirmed');

      if (!requestToken || !requestTokenSecret || confirmed !== 'true') {
        throw new Error('Invalid response from Twitter OAuth');
      }

      const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${requestToken}`;

      return {
        success: true,
        requiresPIN: true,
        authUrl,
        requestToken,
        requestTokenSecret,
      };

    } catch (error) {
      console.error('Twitter auth initiation error:', error);
      return {
        success: false,
        error: 'Failed to initiate Twitter authentication',
      };
    }
  }

  /**
   * Step 2: Complete authentication with PIN
   */
  async completeAuthWithPIN(
    requestToken: string,
    requestTokenSecret: string,
    pin: string
  ): Promise<TwitterAuthResult> {
    try {
      const requestData = {
        url: 'https://api.twitter.com/oauth/access_token',
        method: 'POST',
        data: {
          oauth_verifier: pin,
        },
      };

      const token = {
        key: requestToken,
        secret: requestTokenSecret,
      };

      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...this.oauth.toHeader(this.oauth.authorize(requestData, token)),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `oauth_verifier=${pin}`,
      });

      if (!response.ok) {
        throw new Error('Invalid PIN or authentication failed');
      }

      const responseText = await response.text();
      const params = new URLSearchParams(responseText);
      
      const accessToken = params.get('oauth_token');
      const accessTokenSecret = params.get('oauth_token_secret');
      const userId = params.get('user_id');
      const screenName = params.get('screen_name');

      if (!accessToken || !accessTokenSecret || !userId || !screenName) {
        throw new Error('Invalid response from Twitter');
      }

      // Get user details using the access tokens
      const userDetails = await this.getUserDetails(accessToken, accessTokenSecret);

      return {
        success: true,
        user: {
          id: userId,
          username: screenName,
          name: userDetails.name || screenName,
          profile_image_url: userDetails.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${screenName}`,
          followers_count: userDetails.followers_count || 0,
          following_count: userDetails.friends_count || 0,
        },
        tokens: {
          accessToken,
          accessTokenSecret,
        },
      };

    } catch (error) {
      console.error('Twitter PIN auth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PIN authentication failed',
      };
    }
  }

  /**
   * Get user details using access tokens
   */
  private async getUserDetails(accessToken: string, accessTokenSecret: string) {
    try {
      const requestData = {
        url: 'https://api.twitter.com/1.1/account/verify_credentials.json',
        method: 'GET',
      };

      const token = {
        key: accessToken,
        secret: accessTokenSecret,
      };

      const authHeader = this.oauth.toHeader(this.oauth.authorize(requestData, token));
      const headers: Record<string, string> = {};
      
      // Convert oauth header to proper format
      if (authHeader.Authorization) {
        headers.Authorization = authHeader.Authorization;
      }

      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to get user details');
      }

      return await response.json();

    } catch (error) {
      console.error('Error getting user details:', error);
      return {};
    }
  }

  /**
   * Legacy method for backward compatibility
   * Now redirects to PIN-based auth
   */
  async authenticateWithCredentials(credentials: TwitterCredentials): Promise<TwitterAuthResult> {
    // Redirect to PIN-based authentication
    return this.initiateAuth();
  }
}

/**
 * Real Twitter Authentication Implementation:
 * 
 * This implementation uses Twitter's official OAuth 1.0a flow with PIN-based authentication.
 * This is the recommended and secure way to authenticate users without storing passwords.
 * 
 * Flow:
 * 1. Generate request token and auth URL
 * 2. User visits Twitter auth URL and gets PIN
 * 3. User enters PIN in our app
 * 4. Exchange PIN + request token for access tokens
 * 5. Use access tokens to get user info and make API calls
 * 
 * This approach:
 * - Uses real Twitter authentication
 * - Doesn't require storing user passwords
 * - Follows Twitter's security best practices
 * - Provides real access tokens for API calls
 * - Is the same method used by official Twitter clients
 */
