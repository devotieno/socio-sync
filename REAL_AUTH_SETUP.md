# Real Authentication Setup Guide

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `socialsync-app` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Select or create a Google Analytics account
6. Click "Create project"

### 1.2 Enable Authentication
1. In your Firebase project, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", add your email as test user

### 1.3 Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click **Web app icon** (`</>`)
4. Register app name: `SocialSync Web`
5. Enable "Firebase Hosting" (optional)
6. Copy the configuration object (we'll use this next)

### 1.4 Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (we'll configure rules later)
4. Choose location closest to your users
5. Click "Done"

### 1.5 Enable Storage
1. Go to **Storage**
2. Click "Get started"
3. Start in **test mode**
4. Choose same location as Firestore
5. Click "Done"

## Step 2: Google OAuth Setup

### 2.1 Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Enable **Google+ API** and **People API**

### 2.2 OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Application type: **Web application**
4. Name: `SocialSync OAuth`
5. Authorized origins:
   - `http://localhost:3001`
   - `http://localhost:3000`
6. Authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
7. Click "Create"
8. Copy **Client ID** and **Client Secret**

## Step 3: Update Environment Variables

Replace the placeholder values in `.env.local` with your real credentials:

```bash
# Firebase Configuration (from Step 1.3)
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id

# Google OAuth (from Step 2.2)
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
```

## Step 4: Twitter API Setup (Using Your Existing Credentials)

You already have Twitter API credentials in your `.env.local`. Let's verify they're correct:

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app
3. Go to **Keys and tokens**
4. Verify these match your `.env.local`:
   - API Key → `TWITTER_API_KEY`
   - API Secret → `TWITTER_API_SECRET`
   - Bearer Token → `TWITTER_BEARER_TOKEN`
   - Client ID → `TWITTER_CLIENT_ID`
   - Client Secret → `TWITTER_CLIENT_SECRET`

5. **Update App Settings**:
   - Go to **App settings** > **App info**
   - Website URL: `http://localhost:3001`
   - Terms of Service: `http://localhost:3001/terms`
   - Privacy Policy: `http://localhost:3001/privacy`
   - Callback URLs: `http://localhost:3001/api/twitter/link/callback`

## Step 5: Test the Setup

1. Restart your development server
2. Visit `http://localhost:3001`
3. Try signing up with email/password
4. Try signing in with Google OAuth
5. Connect your Twitter account
6. Test posting a tweet

## Troubleshooting

### Firebase Issues
- **API key invalid**: Double-check all Firebase config values
- **Auth domain error**: Ensure domain matches your project ID

### Google OAuth Issues
- **redirect_uri_mismatch**: Verify callback URLs in Google Console
- **invalid_client**: Check Client ID and Secret

### Twitter Issues
- **Invalid callback URL**: Ensure Twitter app settings match localhost:3001
- **OAuth error**: Verify Client ID and Secret are correct

## Security Notes

- Never commit real API keys to version control
- Use environment variables for all sensitive data
- Enable Firebase Security Rules in production
- Set up proper CORS configuration
