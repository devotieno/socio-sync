# Twitter Authentication Guide

## Overview

SocialSync now supports **real Twitter authentication** using Twitter's official OAuth 1.0a PIN-based authentication flow. This replaces the previous simulated authentication system.

## How It Works

### 1. PIN-Based Authentication (Real Credentials)

When users choose "Real Twitter Login", the system:

1. **Initiates OAuth**: Creates an OAuth 1.0a request token with Twitter
2. **Redirects User**: Provides an authorization URL to Twitter's official login page
3. **PIN Entry**: User enters the PIN provided by Twitter after authorization
4. **Token Exchange**: System exchanges the PIN for access tokens
5. **Account Connection**: Saves the authenticated account to user's profile

### 2. OAuth 2.0 (Session-Based)

Traditional OAuth flow that works with the current user's session.

## Authentication Flow

```
User clicks "Real Twitter Login"
           ↓
System calls /api/twitter/pin-auth/initiate
           ↓
User visits Twitter authorization URL
           ↓
Twitter provides PIN to user
           ↓
User enters PIN in SocialSync
           ↓
System calls /api/twitter/pin-auth/complete
           ↓
Account connected successfully
```

## API Endpoints

### Initiate PIN Auth
- **Endpoint**: `POST /api/twitter/pin-auth/initiate`
- **Returns**: Authorization URL and request tokens

### Complete PIN Auth
- **Endpoint**: `POST /api/twitter/pin-auth/complete`
- **Body**: `{ requestToken, requestTokenSecret, pin }`
- **Returns**: User account data and access tokens

## Security Features

- ✅ **Real OAuth 1.0a**: Uses Twitter's official authentication protocol
- ✅ **No Password Storage**: Never stores user passwords
- ✅ **Secure Token Exchange**: PIN-based verification prevents token theft
- ✅ **Connection Type Tracking**: Distinguishes between OAuth and PIN auth
- ✅ **Multiple Accounts**: Users can connect multiple Twitter accounts

## User Interface

- **Connection Type Badges**: Shows "OAuth" or "Real Auth" for each account
- **Default Account Management**: First account becomes default, can be changed
- **Dual Authentication Options**: Both OAuth 2.0 and PIN-based auth available
- **Account Removal**: Users can disconnect individual accounts

## Testing the Authentication

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3001`
3. Sign in with Google (NextAuth.js)
4. Navigate to Twitter settings
5. Click "Real Twitter Login"
6. Follow the PIN-based authentication flow

## Environment Variables Required

```env
# Twitter API credentials (for OAuth 1.0a)
TWITTER_CONSUMER_KEY=your_consumer_key
TWITTER_CONSUMER_SECRET=your_consumer_secret

# Twitter OAuth 2.0 (for NextAuth.js)
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
```

## Technical Implementation

- **oauth-1.0a**: Library for OAuth 1.0a signature generation
- **crypto-js**: For secure hashing in OAuth signatures
- **twitter-api-v2**: For Twitter API interactions
- **Firebase Firestore**: For storing connected accounts

## Connection Types

1. **OAuth**: Traditional OAuth 2.0 flow through NextAuth.js
2. **Real Auth**: PIN-based OAuth 1.0a with real Twitter credentials

Both types are fully functional and secure, with PIN-based auth providing an alternative for users who prefer direct Twitter authentication.
