# SocioSync - Social Media Management Platform

A comprehensive social media management platform built with Next.js, Firebase, and TypeScript. Schedule posts across multiple platforms, track analytics, and manage all your social media accounts from one dashboard.

## 🚀 Features

- **Multi-Platform Support**: Twitter/X, Facebook, Instagram, LinkedIn, TikTok, Threads, YouTube
- **Post Scheduling**: Schedule posts for optimal engagement times
- **Analytics Dashboard**: Track performance across all platforms
- **Media Management**: Upload and manage images and videos
- **Account Management**: Connect and manage multiple social media accounts
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Live notifications and status updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Authentication**: NextAuth.js with Google OAuth
- **UI Components**: Heroicons, React Hook Form, React Hot Toast
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.0 or higher
- npm or yarn
- Firebase CLI
- Git

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

4. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Social Media API Keys
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET=your_twitter_api_secret
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token

   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret

   INSTAGRAM_APP_ID=your_instagram_app_id
   INSTAGRAM_APP_SECRET=your_instagram_app_secret

   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

   YOUTUBE_API_KEY=your_youtube_api_key
   ```

5. **Set up Firebase Functions**
   ```bash
   cd functions
   npm install
   cd ..
   ```

## 🚀 Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Start Firebase emulators (optional)**
   ```bash
   firebase emulators:start
   ```

3. **Deploy Firebase Functions**
   ```bash
   firebase deploy --only functions
   ```

## 📁 Project Structure

```
sync/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   ├── lib/                   # Utility libraries
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Helper functions
├── functions/                 # Firebase Cloud Functions
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🔐 Social Media API Setup

### Twitter/X API
1. Create a Twitter Developer account
2. Create a new app in the Twitter Developer Portal
3. Generate API keys and bearer token
4. Enable OAuth 2.0 and set callback URL

### Facebook/Instagram API
1. Create a Facebook Developer account
2. Create a new app in the Facebook Developer Console
3. Add Facebook Login and Instagram Basic Display products
4. Configure OAuth redirect URIs

### LinkedIn API
1. Create a LinkedIn Developer account
2. Create a new app in the LinkedIn Developer Portal
3. Request access to the LinkedIn Marketing Developer Platform
4. Configure OAuth 2.0 settings

### YouTube API
1. Create a Google Cloud Platform project
2. Enable the YouTube Data API v3
3. Create credentials (OAuth 2.0 client ID)
4. Configure authorized redirect URIs

## 🎯 Usage

### Creating a Post
1. Navigate to the Dashboard
2. Click "Create New Post"
3. Write your content
4. Select target platforms
5. Schedule or publish immediately

### Managing Accounts
1. Go to "Accounts" in the dashboard
2. Click "Connect" for each platform
3. Complete OAuth authorization
4. Manage connected accounts

### Viewing Analytics
1. Access the Analytics dashboard
2. View performance metrics
3. Filter by platform or date range
4. Export reports

## 🔄 Deployment

### Vercel Deployment
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables in Vercel dashboard**

### Firebase Deployment
1. **Deploy Firebase Functions**
   ```bash
   firebase deploy --only functions
   ```

2. **Deploy Firestore rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Deploy Storage rules**
   ```bash
   firebase deploy --only storage
   ```

## 📊 Analytics & Monitoring

The platform includes comprehensive analytics:
- Post performance metrics
- Engagement rates
- Audience insights
- Platform comparisons
- Custom date ranges

## 🔒 Security

- Firebase Authentication with email/password and Google OAuth
- Secure API route protection
- Firestore security rules
- Environment variable protection
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the FAQ section

## 🔄 Roadmap

- [ ] TikTok API integration
- [ ] Threads API integration (when available)
- [ ] Advanced analytics dashboard
- [ ] Bulk post upload
- [ ] Team collaboration features
- [ ] Custom branding options
- [ ] Mobile app development

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase team for the backend services
- Vercel for hosting and deployment
- All social media platforms for their APIs

3. **Environment Configuration**
   
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your environment variables in `.env.local`:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin SDK
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
   FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Social Media API Keys
   TWITTER_CLIENT_ID=your_twitter_client_id
   TWITTER_CLIENT_SECRET=your_twitter_client_secret
   # ... add other platform credentials
   ```

4. **Firebase Setup**
   
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Google providers)
   - Create Firestore database
   - Enable Storage
   - Download service account key for admin operations

5. **Social Media API Setup**
   
   For each platform you want to integrate:
   - **Twitter**: Apply for developer access at https://developer.twitter.com
   - **Facebook/Instagram**: Create app at https://developers.facebook.com
   - **LinkedIn**: Create app at https://developer.linkedin.com
   - **TikTok**: Apply for developer access at https://developers.tiktok.com
   - **YouTube**: Set up project in Google Cloud Console

## 🏃‍♂️ Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser.

2. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── lib/                   # Library configurations
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── hooks/                 # Custom React hooks
```

## 🔐 Authentication Flow

1. Users can register with email/password or Google OAuth
2. Firebase Authentication handles user management
3. NextAuth.js provides session management
4. Protected routes redirect to sign-in if not authenticated

## 📱 Social Media Integration

### Supported Platforms

- **Twitter/X**: Tweet posting, media upload, analytics
- **Facebook**: Page posting, photo/video upload, insights
- **Instagram**: Business account posting, media upload, metrics
- **LinkedIn**: Profile/company page posting, analytics
- **TikTok**: Video posting, performance metrics
- **Threads**: Text and media posting (via Meta API)
- **YouTube**: Video upload, channel analytics

### OAuth Flow

1. Users connect accounts through OAuth 2.0
2. Access tokens are encrypted and stored securely
3. Refresh tokens handle automatic token renewal
4. Rate limiting prevents API quota exhaustion

## 📊 Features Overview

### Dashboard
- Overview of connected accounts
- Recent posts and performance
- Quick action buttons
- Analytics summary

### Post Creation
- Rich text editor
- Media upload (images/videos)
- Platform selection
- Scheduling options

### Analytics
- Engagement metrics per platform
- Performance comparisons
- Growth tracking
- Export capabilities

### Account Management
- Connect/disconnect social accounts
- View account status
- Manage permissions

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Environment Variables**
   Add all environment variables in Vercel dashboard

3. **Domain Configuration**
   Update NEXTAUTH_URL with your production domain

### Firebase Functions

For scheduling and background tasks:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Deploy Functions**
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

## 🔒 Security Features

- **Token Encryption**: Social media tokens encrypted at rest
- **Rate Limiting**: API request throttling
- **Input Validation**: All user inputs sanitized
- **CORS Configuration**: Proper cross-origin settings
- **Firebase Security Rules**: Database access control

## 📈 Performance Optimization

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: API response caching
- **CDN**: Media files served via Firebase Storage CDN

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the FAQ section

## 🔄 Roadmap

- [ ] AI-powered content suggestions
- [ ] Team collaboration features
- [ ] Advanced analytics with ML insights
- [ ] Mobile app development
- [ ] Additional platform integrations

---

Built with ❤️ using Next.js, Firebase, and modern web technologies.
