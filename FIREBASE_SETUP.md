# 🔥 Firebase Setup Guide for SocialSync

## Quick Start

Your SocialSync application is currently running in **demo mode**. To enable full functionality, follow these steps:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name your project (e.g., "socialsync-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firebase Services

#### Authentication
1. In the Firebase console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
5. Enable **Google** (optional, for OAuth)

#### Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode**
4. Select a location close to your users

#### Storage
1. Go to **Storage**
2. Click "Get started"
3. Choose **Start in test mode**
4. Use the same location as Firestore

### 3. Get Your Configuration

1. Go to **Project settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app (</>) icon
4. Name your app (e.g., "SocialSync Web")
5. Copy the config object

### 4. Update Environment Variables

1. Open `.env.local` in your project root
2. Replace the demo values with your Firebase config:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Optional: Google OAuth Setup

To enable "Sign in with Google":

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Create OAuth 2.0 Client IDs
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
6. Add the client ID and secret to `.env.local`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Social Media API Keys (Twitter/X Setup)

## Twitter/X Developer Setup (REQUIRED for Twitter Integration)

### 1. Create Twitter Developer Account

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Sign in with your Twitter account
3. Click "Apply for access" and complete the application:
   - Select "Making a bot" or "Building tools for Twitter users"
   - Describe your SocialSync application
   - Agree to the Developer Agreement

### 2. Create a Twitter App

1. Once approved, go to the [Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Click "Create App" and fill in:
   - **App Name**: `SocialSync` (or your preferred name)
   - **Description**: `Social media management platform for cross-platform posting`
   - **Website URL**: `https://example.com` (placeholder for development)
   - **Terms of Service**: `https://example.com/terms` (placeholder for development)
   - **Privacy Policy**: `https://example.com/privacy` (placeholder for development)

### 3. Configure OAuth 2.0 Settings

1. In your app dashboard, go to **Settings** → **User authentication settings**
2. Click **Set up** and configure:
   - **OAuth 2.0**: Enable
   - **OAuth 1.0a**: Disable (not needed)
   - **Request email address**: Enable
   - **App permissions**: Read and Write
   - **Type of app**: Web App
   - **Callback URI**: `http://localhost:3000/api/auth/callback/twitter`
   - **Website URL**: Use one of these options:
     - `https://yourdomain.com` (if you have a domain)
     - `https://example.com` (placeholder, Twitter accepts this)
     - `https://socialsync.app` (placeholder domain)
     - `https://www.example.com` (another accepted placeholder)

### 4. Get API Keys

1. Go to **Keys and tokens** tab
2. Copy the following values:
   - **Consumer Key (API Key)**
   - **Consumer Secret (API Secret)**
   - **Bearer Token** (optional, for read-only operations)

### 5. Add to Environment Variables

Add these to your `.env.local` file:

```env
# Twitter API Configuration
TWITTER_CLIENT_ID=your_consumer_key_here
TWITTER_CLIENT_SECRET=your_consumer_secret_here
```

### 6. Test the Integration

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/dashboard/accounts`
3. Click "Connect Account" for Twitter
4. Complete the OAuth flow
5. Try creating and posting a tweet from the create post page

### Twitter API Features Implemented

✅ **OAuth 2.0 Authentication**: Secure login and token management  
✅ **Tweet Posting**: Post text tweets up to 280 characters  
✅ **Media Upload**: Support for images and videos (ready for implementation)  
✅ **Scheduled Posts**: Queue tweets for future posting  
✅ **Account Management**: Connect/disconnect Twitter accounts  
✅ **Error Handling**: Comprehensive error management and user feedback  
✅ **Rate Limiting**: Proper handling of Twitter API rate limits  

### Rate Limits & Best Practices

- **Tweet Creation**: 300 requests per 15-minute window
- **Media Upload**: 300 requests per 15-minute window
- **User Lookup**: 300 requests per 15-minute window
- Always check rate limit headers in responses
- Implement exponential backoff for rate limit errors
- Store minimal user data (username, name, profile image)

### Troubleshooting

**"Invalid website URL" Error**
- Twitter doesn't accept `localhost` URLs for any of these fields:
  - Website URL
  - Terms of Service URL  
  - Privacy Policy URL
- Use placeholders like:
  - Website: `https://example.com`
  - Terms: `https://example.com/terms`
  - Privacy: `https://example.com/privacy`
- These URLs are just for display during OAuth - they don't affect functionality
- The callback URL (`http://localhost:3000/api/auth/callback/twitter`) is what matters for development
- You can update these URLs later when you deploy to production

**"Invalid Client ID"**
- Verify TWITTER_CLIENT_ID in .env.local
- Check that the consumer key is correct

**"Callback URL Mismatch"**
- Ensure callback URL in Twitter app settings matches exactly
- For development with account linking: `http://localhost:3001/api/twitter/link/callback`
- For development with NextAuth: `http://localhost:3001/api/auth/callback/twitter`
- Note: Port 3001 is used in this project (check your package.json dev script)

**"App Permissions Insufficient"**
- Verify app has "Read and Write" permissions
- Regenerate access tokens after permission changes

**"Duplicate Content" Error**
- Twitter blocks identical tweets
- Add timestamp or variation to content if needed

## Other Social Media Platforms (Coming Soon)

As you develop, you'll need API keys for:
- ✅ Twitter/X Developer Platform (Setup above)
- Meta for Developers (Facebook/Instagram)
- LinkedIn Developer Platform
- TikTok for Developers
- YouTube Data API

Add these to `.env.local` when you're ready to integrate each platform.

## Security Notes

- Never commit `.env.local` to version control
- Use different Firebase projects for development and production
- Set up proper Firestore security rules before going to production
- Enable App Check for additional security

## Troubleshooting

- **"Firebase not configured"**: Check your environment variables
- **"Invalid API key"**: Ensure your API key is correct and the web app is properly configured
- **Permission denied**: Check Firestore security rules
- **CORS errors**: Ensure your domain is authorized in Firebase settings

Happy coding! 🚀
