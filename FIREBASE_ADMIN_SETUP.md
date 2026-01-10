# Firebase Admin SDK Setup Guide

The scheduled posts feature requires Firebase Admin SDK credentials to bypass security rules when publishing posts automatically.

## Steps to Get Your Firebase Admin Credentials:

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/project/ai-reputation/settings/serviceaccounts/adminsdk

2. **Generate a New Private Key:**
   - Click on "Service accounts" tab
   - Click "Generate new private key" button
   - Confirm and download the JSON file

3. **Extract Values from the Downloaded JSON:**
   The JSON file will look like this:
   ```json
   {
     "type": "service_account",
     "project_id": "ai-reputation",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@ai-reputation.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "...",
     "token_uri": "...",
     "auth_provider_x509_cert_url": "...",
     "client_x509_cert_url": "..."
   }
   ```

4. **Update Your `.env.local` File:**
   Add these three values to your `.env.local`:
   
   ```env
   FIREBASE_PROJECT_ID=ai-reputation
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ai-reputation.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Actual-Key-Here\n-----END PRIVATE KEY-----\n"
   ```

   **Important:** 
   - Keep the `\n` characters in the private key - don't replace them with actual newlines
   - Wrap the private key in double quotes
   - Keep the entire key on one line

5. **Restart Your Dev Server:**
   ```bash
   npm run dev
   ```

## Current Status:

✅ Firestore security rules updated
✅ Twitter account DELETE endpoint added
❌ Firebase Admin credentials needed for scheduled posts

Without the Admin credentials:
- ✅ User authentication works
- ✅ Creating posts works
- ✅ Viewing posts works
- ❌ Automatic scheduled post publishing won't work

The scheduled posts feature will show a clear error message until you add these credentials.
