# OAuth Setup Checklist

Use this checklist to track your progress setting up OAuth applications for each platform.

## 🔰 Prerequisites
- [ ] Business email address
- [ ] Production domain name (if deploying)
- [ ] SSL certificate for production domain
- [ ] Business information ready (name, address, etc.)

## 📘 Facebook & Instagram Setup

### Facebook Developer Account
- [ ] Created Facebook Developer account
- [ ] Verified email address
- [ ] Business verification completed (if required)

### Facebook App Creation
- [ ] Created new Facebook app (Business type)
- [ ] Added app name: "Social Media Posting Hub"
- [ ] Added app contact email
- [ ] Associated with business account

### Facebook App Configuration
- [ ] Added app domain in Basic Settings
- [ ] Added Privacy Policy URL
- [ ] Added Terms of Service URL
- [ ] Added User Data Deletion URL
- [ ] Uploaded app icon (1024x1024)

### Facebook Login Setup
- [ ] Added Facebook Login product
- [ ] Configured OAuth redirect URIs:
  - [ ] Development: `http://localhost:3000/api/facebook/callback`
  - [ ] Production: `https://yourdomain.com/api/facebook/callback`
- [ ] Enabled Client OAuth Login
- [ ] Enabled Web OAuth Login

### Instagram Basic Display Setup
- [ ] Added Instagram Basic Display product
- [ ] Configured OAuth redirect URIs:
  - [ ] Development: `http://localhost:3000/api/instagram/callback`
  - [ ] Production: `https://yourdomain.com/api/instagram/callback`
- [ ] Added Deauthorize Callback URL
- [ ] Added Data Deletion Request URL

### Facebook Permissions Request
- [ ] Requested `pages_manage_posts` permission
- [ ] Requested `pages_read_engagement` permission
- [ ] Requested `instagram_basic` permission
- [ ] Requested `instagram_content_publish` permission
- [ ] Submitted app for review

### Facebook Environment Variables
- [ ] Copied App ID to `FACEBOOK_APP_ID`
- [ ] Copied App Secret to `FACEBOOK_APP_SECRET`
- [ ] Generated webhook verify token for `FACEBOOK_WEBHOOK_VERIFY_TOKEN`
- [ ] Set same values for Instagram variables

## 🔗 LinkedIn Setup

### LinkedIn Developer Account
- [ ] Created LinkedIn Developer account
- [ ] Verified email address
- [ ] Created or have access to LinkedIn business page

### LinkedIn App Creation
- [ ] Created new LinkedIn app
- [ ] Added app name: "Social Media Posting Hub"
- [ ] Associated with LinkedIn business page
- [ ] Added Privacy Policy URL
- [ ] Uploaded app logo (300x300)

### LinkedIn OAuth Configuration
- [ ] Added OAuth redirect URIs:
  - [ ] Development: `http://localhost:3000/api/linkedin/callback`
  - [ ] Production: `https://yourdomain.com/api/linkedin/callback`

### LinkedIn Products Request
- [ ] Requested "Sign In with LinkedIn" (usually auto-approved)
- [ ] Requested "Marketing Developer Platform"
- [ ] Requested "Share on LinkedIn"
- [ ] Submitted use case description
- [ ] Provided app screenshots

### LinkedIn Environment Variables
- [ ] Copied Client ID to `LINKEDIN_CLIENT_ID`
- [ ] Copied Client Secret to `LINKEDIN_CLIENT_SECRET`

## 🎵 TikTok Setup (Optional)

### TikTok Developer Account
- [ ] Created TikTok for Developers account
- [ ] Verified business information
- [ ] Completed developer onboarding

### TikTok App Creation
- [ ] Created new TikTok app
- [ ] Added app name and description
- [ ] Configured redirect URI
- [ ] Requested required permissions

### TikTok Environment Variables
- [ ] Copied Client Key to `TIKTOK_CLIENT_KEY`
- [ ] Copied Client Secret to `TIKTOK_CLIENT_SECRET`

## 🎥 YouTube Setup (Optional)

### Google Cloud Console
- [ ] Created Google Cloud project
- [ ] Enabled YouTube Data API v3
- [ ] Created OAuth 2.0 credentials
- [ ] Configured authorized redirect URIs

### YouTube Environment Variables
- [ ] Copied Client ID to `GOOGLE_CLIENT_ID`
- [ ] Copied Client Secret to `GOOGLE_CLIENT_SECRET`
- [ ] Copied API Key to `YOUTUBE_API_KEY`

## 🔧 Environment Configuration

### Local Development
- [ ] Created `.env.local` file
- [ ] Added all required environment variables
- [ ] Set `NEXTAUTH_URL=http://localhost:3000`
- [ ] Generated secure `NEXTAUTH_SECRET`

### Production Environment
- [ ] Configured environment variables on hosting platform
- [ ] Updated `NEXTAUTH_URL` to production domain
- [ ] Verified all OAuth redirect URLs are production URLs
- [ ] Enabled HTTPS/SSL

## 🧪 Testing

### Local Testing
- [ ] Started development server (`npm run dev`)
- [ ] Tested Facebook OAuth flow
- [ ] Tested Instagram OAuth flow
- [ ] Tested LinkedIn OAuth flow
- [ ] Verified account connections work
- [ ] Tested posting functionality

### Production Testing
- [ ] Deployed to production
- [ ] Tested all OAuth flows in production
- [ ] Verified HTTPS is working
- [ ] Tested with real social media accounts
- [ ] Verified posting works across platforms

## 📋 App Review Status

### Facebook/Instagram
- [ ] App submitted for review
- [ ] Business verification completed (if required)
- [ ] Review approved
- [ ] App is live and public

### LinkedIn
- [ ] Partner program application submitted
- [ ] Use case approved
- [ ] API access granted
- [ ] App is live

## 🔒 Security Checklist

- [ ] API keys stored securely (not in code)
- [ ] Environment variables properly configured
- [ ] HTTPS enabled in production
- [ ] Webhook signatures verified
- [ ] Rate limiting implemented
- [ ] Error handling for API failures
- [ ] User consent flows implemented
- [ ] Token refresh logic implemented

## 📞 Support Resources

- **Facebook**: [Facebook Developers Community](https://developers.facebook.com/community/)
- **Instagram**: [Instagram Platform Documentation](https://developers.facebook.com/docs/instagram)
- **LinkedIn**: [LinkedIn Developer Support](https://developer.linkedin.com/support)
- **TikTok**: [TikTok for Developers](https://developers.tiktok.com/)
- **YouTube**: [YouTube API Support](https://developers.google.com/youtube/v3/support)

## ✅ Completion

- [ ] All OAuth apps configured
- [ ] All environment variables set
- [ ] All platforms tested
- [ ] App reviews approved
- [ ] Production deployment successful
- [ ] Documentation updated

**Estimated Timeline**: 2-3 weeks (including app review processes)

---

💡 **Pro Tip**: Start with Facebook and LinkedIn as they have the most comprehensive posting capabilities. Instagram requires a business account connected to Facebook, and TikTok/YouTube are primarily for video content.
