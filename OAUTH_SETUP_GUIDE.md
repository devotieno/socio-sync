# OAuth Application Setup Guide

This guide walks you through setting up OAuth applications for Facebook, Instagram, and LinkedIn to enable social media posting functionality.

## Prerequisites
- Developer accounts on each platform
- Production domain (requ### Test LinkedIn Connection
```bash
# Visit in browser
http://localhost:3000/api/linkedin/auth
```

### Test Threads Connection
```bash
# Visit in browser
http://localhost:3000/api/threads/auth
```for some platforms)
- SSL certificate (HTTPS required)

## 1. Facebook & Instagram Setup

Facebook and Instagram use the same app since Instagram is owned by Meta.

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" → "Business" → "Next"
3. Fill in app details:
   - **App Name**: "Social Media Posting Hub" (or your preferred name)
   - **App Contact Email**: Your business email
   - **Business Account**: Select or create a business account
   - **App Icon**: Upload a square image (512x512 to 1024x1024 pixels, max 5MB)

### Step 1.5: Select Use Cases
When prompted to select use cases for your app, Facebook's interface may limit your selections or not show all options. Here's how to handle this:

**🎯 PRIORITY APPROACH - Start with these:**
- ✅ **"Authenticate and request data from users with Facebook Login"**
  - This is usually always available and is your foundation
- ✅ **"Manage everything on your Page"**
  - This covers Facebook Pages posting and is essential

**🧵 THREADS INTEGRATION - Multiple Options:**

**Option 1: If "Access the Threads API" is visible**
- ✅ Select **"Access the Threads API"** if it appears in the list

**Option 2: If Threads API is not visible (common)**
- ✅ Select **"Other"** - This gives you access to all products in the old interface
- ✅ Or select **"Embed Facebook, Instagram and Threads content in other websites"** (may include Threads access)

**Option 3: Add Threads Later**
- Start with Facebook Login + Page Management
- Add Threads API product manually after app creation (recommended approach)

**⚠️ IMPORTANT - Threads API Availability:**
- **Threads API is still in limited access** as of 2025
- **You may need to apply for early access** through Meta
- **Not all developers have immediate access** to Threads API
- **Start with Facebook + Instagram, add Threads when available**

**✅ OPTIONAL Use Cases** (select if available and needed):
- **"Share or create fundraisers on Facebook and Instagram"**
  - Useful for content sharing capabilities
- **"Embed Facebook, Instagram and Threads content in other websites"**
  - Helpful for content management features
- **"Create & manage app ads with Meta Ads Manager"** - Only if you need advertising features

**❌ SKIP These Use Cases** (unless specifically needed):
- **"Launch a game on Facebook"** - Not relevant for social media management
- **"Advertise on your app with Meta Audience Network"** - Monetization feature
- **"Allow users to transfer their data to other apps"** - Data portability feature
- **"Join ThreatExchange"** - Security/threat intelligence platform

**🔧 RECOMMENDED STRATEGY:**

1. **Minimum Viable Selection:**
   - "Authenticate and request data from users with Facebook Login"
   - "Manage everything on your Page"

2. **If you can't select multiple:**
   - Select **"Other"** to get full control
   - Or start with just Facebook Login and add products later

3. **Add Products After Creation:**
   - You can always add Instagram Basic Display later
   - You can apply for Threads API access separately
   - This is often easier than trying to select everything upfront

**⚠️ IMPORTANT Notes**:
- **Facebook's interface changes frequently** - don't worry if you can't select all use cases
- **"Manage everything on your Page"** is the most important for posting
- **Threads API may require separate application** or early access approval
- **You can add products after app creation** in the App Dashboard
- **Start simple and expand** - it's easier to add features than start complex

**🚀 QUICK START APPROACH:**
If you're having trouble with use case selection:
1. **Select "Other"** to bypass use case restrictions
2. **Or select just "Facebook Login"** and add products manually
3. **Focus on getting the app created first** - you can configure everything after

**💡 Updated Recommendation**: 
- **Minimum**: "Authenticate and request data from users with Facebook Login"
- **Add manually later**: Instagram Basic Display, Threads API (when available)
- **This approach is more reliable** than trying to select everything upfront

**🔧 Alternative Option**:
If you don't see the exact use cases you need, you can select:
- **"Other"** - This creates your app in the old experience where you can choose from all available permissions, features and products
- Use this option if you need more granular control over specific permissions

**💡 Updated Recommendation**: 
- **If you can select multiple**: Choose "Facebook Login" + "Manage everything on your Page"
- **If you can only select one**: Choose "Other" for maximum flexibility
- **If neither works**: Start with just "Facebook Login" and add products in App Dashboard
- **Threads API**: Apply separately through Meta's early access program

### Step 2: Configure App Settings
1. In App Dashboard → Settings → Basic
2. Add **App Domains**: `localhost` (for development) or `yourdomain.com` (for production)
3. Add **Privacy Policy URL**: 
   - Development: `http://localhost:3000/privacy`
   - Production: `https://yourdomain.com/privacy`
4. Add **Terms of Service URL**: 
   - Development: `http://localhost:3000/terms`
   - Production: `https://yourdomain.com/terms`
5. Add **User Data Deletion URL**: `https://yourdomain.com/data-deletion` (⚠️ Must be HTTPS)
6. **App Icon Requirements**:
   - **Size**: Between 512x512 and 1024x1024 pixels (square format)
   - **File Format**: PNG or JPG
   - **File Size**: Maximum 5MB
   - **Design**: Should represent your brand/app clearly
   - **Background**: Avoid transparent backgrounds for better visibility
   - **Tip**: Use your main app icon (save as `icon-512.png` in your public folder)

### Step 2.5: Add Products Manually (if needed)
If you couldn't select all use cases during creation, add products manually:

1. **Go to App Dashboard → Add Product**
2. **Add these products one by one:**
   - **Facebook Login** (if not already added)
   - **Instagram Basic Display** 
   - **Threads API** (if available - may require application)

**Note**: This is often more reliable than trying to select everything during app creation.

### Step 3: Add Facebook Login Product
1. Go to App Dashboard → Add Product
2. Find "Facebook Login" → Click "Set Up"
3. In Facebook Login → Settings:
   - **Valid OAuth Redirect URIs**: 
     - **Development**: Facebook automatically allows `http://localhost:*` URLs (no need to add manually)
     - **Production**: Add `https://yourdomain.com/api/facebook/callback`

### Step 4: Add Instagram Basic Display
1. App Dashboard → Add Product → "Instagram Basic Display"
2. Create New App (if prompted)
3. In Instagram Basic Display → Basic Display:
   - **Valid OAuth Redirect URIs**:
     - **Development**: Facebook automatically allows `http://localhost:*` URLs (no need to add manually)
     - **Production**: Add `https://yourdomain.com/api/instagram/callback`
   - **Deauthorize Callback URL**: `https://yourdomain.com/api/instagram/deauth`
   - **Data Deletion Request URL**: `https://yourdomain.com/api/instagram/delete`

### Step 4.5: Add Threads API (if available)
**Important**: Threads API is currently in limited access. You may need to:

1. **Check availability**: App Dashboard → Add Product → Look for "Threads API"
2. **If available**: 
   - **Development**: Facebook automatically allows `http://localhost:*` URLs
   - **Production**: Configure OAuth redirect URIs: `https://yourdomain.com/api/threads/callback`
   - Set up webhook URL if required
3. **If not available**:
   - **Apply for early access** through Meta Developer site
   - **Join the waitlist** for Threads API access
   - **Continue with Facebook + Instagram** for now

**Alternative**: Start with Facebook and Instagram integration, add Threads later when API access is granted.

### Step 5: Request Advanced Permissions
For production posting, you'll need to request these permissions during app review:

**Essential Permissions** (start with these):
- ✅ `pages_manage_posts` - Post to Facebook pages you manage
- ✅ `pages_read_engagement` - Read page insights and metrics
- ✅ `pages_show_list` - Access list of pages you manage
- ✅ `instagram_basic` - Basic Instagram account access
- ✅ `instagram_content_publish` - Publish content to Instagram

**Threads Permissions** (if API access is granted):
- ✅ `threads_basic` - Basic Threads account access
- ✅ `threads_content_publish` - Publish content to Threads

**Additional Permissions** (request later if needed):
- `pages_manage_metadata` - Update page information
- `pages_read_user_content` - Read user posts on your pages
- `instagram_manage_insights` - Access Instagram analytics
- `threads_manage_insights` - Access Threads analytics (if available)
- `business_management` - Manage business assets

**Permission Justification Examples**:
When submitting for review, explain your use cases clearly:

> "Our application is a social media management tool that allows businesses to schedule and publish content across multiple platforms. We need pages_manage_posts to enable users to post content to their Facebook business pages, and instagram_content_publish to allow posting to their connected Instagram business accounts. The pages_read_engagement permission is required to provide users with analytics about their post performance. We plan to add Threads integration when API access becomes available."

**For Threads API Application** (separate submission):
> "We are requesting early access to the Threads API to extend our social media management platform. Our existing Facebook and Instagram integration demonstrates our commitment to the Meta ecosystem, and we want to provide our users with comprehensive posting capabilities across all Meta platforms."

### Step 6: Get App Credentials
1. App Dashboard → Settings → Basic
2. Copy **App ID** and **App Secret**
3. Add to your `.env.local`:
```env
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
INSTAGRAM_APP_ID=your_app_id_here
INSTAGRAM_APP_SECRET=your_app_secret_here
THREADS_APP_ID=your_app_id_here
THREADS_APP_SECRET=your_app_secret_here
```

## 2. LinkedIn Setup

### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developers](https://developer.linkedin.com/)
2. Click "Create App"
3. Fill in app details:
   - **App Name**: "Social Media Posting Hub"
   - **LinkedIn Page**: Your business page (required)
   - **Privacy Policy URL**: `https://yourdomain.com/privacy`
   - **App Logo**: Upload a 300x300px logo

### Step 2: Configure OAuth Settings
1. In App Dashboard → Auth tab
2. Add **Authorized Redirect URLs**:
   - `http://localhost:3000/api/linkedin/callback` (development)
   - `https://yourdomain.com/api/linkedin/callback` (production)

### Step 3: Request API Products
1. Go to Products tab
2. Request access to:
   - **Sign In with LinkedIn** (free)
   - **Marketing Developer Platform** (requires approval)
   - **Share on LinkedIn** (requires approval)

### Step 4: Get App Credentials
1. Auth tab → Application credentials
2. Copy **Client ID** and **Client Secret**
3. Add to your `.env.local`:
```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
```

## 3. Environment Configuration

Update your `.env.local` file with all the credentials:

```env
# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Facebook & Instagram & Threads
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
INSTAGRAM_APP_ID=your_facebook_app_id
INSTAGRAM_APP_SECRET=your_facebook_app_secret
THREADS_APP_ID=your_facebook_app_id
THREADS_APP_SECRET=your_facebook_app_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Google (for YouTube)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
YOUTUBE_API_KEY=your_youtube_api_key

# TikTok
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## 4. App Review & Approval Process

### Facebook/Instagram
1. **Development Mode**: Test with admin accounts and test users
2. **App Review Preparation**:
   - **Screenshots**: Provide clear screenshots showing how permissions are used
   - **Screen Recording**: 3-5 minute video demonstrating the posting flow
   - **Privacy Policy**: Must be accessible and cover data usage
   - **Terms of Service**: Clear terms for your app users
   - **Use Case Description**: Detailed explanation of why you need each permission

3. **App Review Submission**:
   ```
   Use Case: Social Media Management Platform
   
   Description: Our application helps businesses manage their social media presence by allowing them to create, schedule, and publish content across multiple platforms including Facebook Pages and Instagram business accounts.
   
   How we use pages_manage_posts:
   - Users can compose posts within our interface
   - Posts are published to their connected Facebook Pages
   - Scheduling functionality allows posting at optimal times
   
   How we use instagram_content_publish:
   - Users can publish photos and videos to Instagram business accounts
   - Content is posted through our unified interface
   - Supports both immediate and scheduled posting
   
   Data Usage:
   - We only access pages the user manages
   - No data is stored permanently on our servers
   - Users maintain full control over their content
   ```

4. **Business Verification**: May require business verification for advanced features
5. **Timeline**: 2-7 days for standard review, 2-4 weeks for business verification

### LinkedIn
1. **Development**: Use with your own account initially
2. **Partner Program**: Apply for Marketing Developer Platform
3. **Review Process**: Submit use case and app screenshots
4. **Timeline**: 5-10 business days

## 5. Testing OAuth Flows

After setup, test each platform:

### Test Facebook Connection
```bash
# Visit in browser
http://localhost:3000/api/facebook/auth
```

### Test Instagram Connection
```bash
# Visit in browser
http://localhost:3000/api/instagram/auth
```

### Test LinkedIn Connection
```bash
# Visit in browser
http://localhost:3000/api/linkedin/auth
```

## 6. Production Deployment Checklist

- [ ] All OAuth redirect URLs updated to production domain
- [ ] SSL certificate installed and working
- [ ] Environment variables configured on hosting platform
- [ ] App privacy policy and terms of service published
- [ ] Facebook app submitted for review
- [ ] LinkedIn app approved for required products
- [ ] Test all OAuth flows in production

## 7. Common Issues & Solutions

### Facebook/Instagram Issues
- **Invalid OAuth redirect URI**: Check exact URL matches in app settings (case-sensitive)
- **App not approved**: Some features limited until app review approval
- **Business verification required**: Larger scale apps need business verification
- **Wrong app type selected**: Make sure you selected "Business" not "Consumer" or "Gaming"
- **Missing use case**: Ensure you selected the correct use cases during app creation
- **Insufficient justification**: App review rejections often due to unclear use case descriptions

### Facebook App Creation Mistakes to Avoid
- ❌ **Don't select "Consumer" app type** - This limits business features
- ❌ **Don't skip the use case selection** - This determines available products
- ❌ **Don't use vague app names** - Use descriptive names like "Social Media Manager"
- ❌ **Don't forget business page association** - Required for many permissions
- ❌ **Don't submit review without testing** - Test thoroughly in development mode first

### Instagram-Specific Requirements
- **Business Account Required**: Personal Instagram accounts cannot use publishing APIs
- **Facebook Page Connection**: Instagram business account must be connected to a Facebook Page
- **Content Guidelines**: All content must comply with Instagram's community guidelines
- **Rate Limits**: Instagram has stricter rate limits than Facebook

### LinkedIn Issues
- **Redirect URL mismatch**: LinkedIn is strict about exact URL matching
- **Limited API access**: Many features require partner program approval
- **Page association**: App must be associated with a LinkedIn business page

### General OAuth Issues
- **HTTPS required**: Most platforms require HTTPS in production
- **CORS errors**: Ensure proper domain configuration
- **Token expiration**: Implement proper token refresh logic

## 8. Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **Token Storage**: Store access tokens securely (encrypted in database)
3. **Webhook Verification**: Verify webhook signatures from platforms
4. **Rate Limiting**: Implement rate limiting to avoid API limits
5. **Error Handling**: Proper error handling for API failures
6. **User Consent**: Clear consent flow for data access

## Need Help?

- **Facebook Support**: [Facebook Developers Community](https://developers.facebook.com/community/)
- **LinkedIn Support**: [LinkedIn Developer Support](https://developer.linkedin.com/support)
- **Documentation**: Check each platform's official documentation for latest updates

---

**Note**: API requirements and review processes change frequently. Always check the latest documentation on each platform's developer portal.
